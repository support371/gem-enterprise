import { z } from "zod";
import { TokMetricError } from "@/lib/tokmetric/security";
import {
  TIKTOK_PRIVACY_LEVELS,
  type TikTokChunkPlan,
  type TikTokCreatorInfo,
  type TikTokPrivacyLevel,
  type TikTokPublishStatus,
  type TikTokVideoSource,
} from "./types";

const TIKTOK_API_ORIGIN = "https://open.tiktokapis.com";

const errorSchema = z.object({
  code: z.string(),
  message: z.string().optional().default(""),
  log_id: z.string().optional(),
  logid: z.string().optional(),
});

const creatorInfoSchema = z.object({
  data: z.object({
    creator_avatar_url: z.string().nullable().optional(),
    creator_username: z.string(),
    creator_nickname: z.string(),
    privacy_level_options: z.array(z.enum(TIKTOK_PRIVACY_LEVELS)),
    comment_disabled: z.boolean(),
    duet_disabled: z.boolean(),
    stitch_disabled: z.boolean(),
    max_video_post_duration_sec: z.number().int().positive(),
  }),
  error: errorSchema,
});

const initSchema = z.object({
  data: z.object({
    publish_id: z.string().min(1).max(64),
    upload_url: z.string().url().optional(),
  }),
  error: errorSchema,
});

const statusSchema = z.object({
  data: z.object({
    status: z.string(),
    fail_reason: z.string().nullable().optional(),
    publicaly_available_post_id: z.array(z.union([z.string(), z.number()])).optional(),
    publicly_available_post_id: z.array(z.union([z.string(), z.number()])).optional(),
    uploaded_bytes: z.number().int().nonnegative().optional(),
    downloaded_bytes: z.number().int().nonnegative().optional(),
  }),
  error: errorSchema,
});

async function callTikTok<T extends z.ZodTypeAny>(
  accessToken: string,
  path: string,
  schema: T,
  body?: unknown,
): Promise<z.infer<T>> {
  const response = await fetch(`${TIKTOK_API_ORIGIN}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  }).catch(() => {
    throw new TokMetricError(502, "TIKTOK_NETWORK_ERROR", "TikTok could not be reached. Try again shortly.");
  });

  const payload = await response.json().catch(() => null);
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new TokMetricError(502, "TIKTOK_INVALID_RESPONSE", "TikTok returned an unexpected response.");
  }

  if (!response.ok || parsed.data.error.code !== "ok") {
    const code = parsed.data.error.code || "unknown_error";
    const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
    throw new TokMetricError(status, `TIKTOK_${code.toUpperCase()}`, parsed.data.error.message || "TikTok rejected the request.");
  }

  return parsed.data;
}

export async function queryTikTokCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo> {
  const response = await callTikTok(accessToken, "/v2/post/publish/creator_info/query/", creatorInfoSchema);
  return {
    creatorAvatarUrl: response.data.creator_avatar_url ?? null,
    creatorUsername: response.data.creator_username,
    creatorNickname: response.data.creator_nickname,
    privacyLevelOptions: response.data.privacy_level_options,
    commentDisabled: response.data.comment_disabled,
    duetDisabled: response.data.duet_disabled,
    stitchDisabled: response.data.stitch_disabled,
    maxVideoPostDurationSec: response.data.max_video_post_duration_sec,
  };
}

export type TikTokDirectPostInput = {
  title: string;
  privacyLevel: TikTokPrivacyLevel;
  disableComment: boolean;
  disableDuet: boolean;
  disableStitch: boolean;
  videoCoverTimestampMs?: number;
  brandContentToggle: boolean;
  brandOrganicToggle: boolean;
  isAigc: boolean;
  source: TikTokVideoSource;
  chunkPlan?: TikTokChunkPlan;
  videoUrl?: string;
};

export async function initializeTikTokDirectPost(accessToken: string, input: TikTokDirectPostInput) {
  const sourceInfo = input.source === "FILE_UPLOAD"
    ? {
        source: "FILE_UPLOAD" as const,
        video_size: input.chunkPlan?.videoSize,
        chunk_size: input.chunkPlan?.chunkSize,
        total_chunk_count: input.chunkPlan?.totalChunkCount,
      }
    : {
        source: "PULL_FROM_URL" as const,
        video_url: input.videoUrl,
      };

  const response = await callTikTok(accessToken, "/v2/post/publish/video/init/", initSchema, {
    post_info: {
      title: input.title,
      privacy_level: input.privacyLevel,
      disable_comment: input.disableComment,
      disable_duet: input.disableDuet,
      disable_stitch: input.disableStitch,
      ...(input.videoCoverTimestampMs === undefined ? {} : { video_cover_timestamp_ms: input.videoCoverTimestampMs }),
      brand_content_toggle: input.brandContentToggle,
      brand_organic_toggle: input.brandOrganicToggle,
      is_aigc: input.isAigc,
    },
    source_info: sourceInfo,
  });

  if (input.source === "FILE_UPLOAD" && !response.data.upload_url) {
    throw new TokMetricError(502, "TIKTOK_UPLOAD_URL_MISSING", "TikTok did not return a video upload URL.");
  }

  return {
    publishId: response.data.publish_id,
    uploadUrl: response.data.upload_url ?? null,
  };
}

export async function fetchTikTokPublishStatus(accessToken: string, publishId: string): Promise<TikTokPublishStatus> {
  const response = await callTikTok(accessToken, "/v2/post/publish/status/fetch/", statusSchema, { publish_id: publishId });
  const status = response.data.status.toUpperCase();
  const failed = status === "FAILED" || status.includes("FAIL");
  const succeeded = ["PUBLISH_COMPLETE", "PUBLISHED", "PUBLICLY_AVAILABLE", "SEND_TO_USER_INBOX"].some((value) => status.includes(value));
  const isFinal = failed || succeeded;
  const ids = response.data.publicly_available_post_id ?? response.data.publicaly_available_post_id ?? [];

  return {
    status: response.data.status,
    failReason: response.data.fail_reason ?? null,
    publiclyAvailablePostIds: ids.map(String),
    uploadedBytes: response.data.uploaded_bytes ?? null,
    downloadedBytes: response.data.downloaded_bytes ?? null,
    isFinal,
    succeeded,
  };
}

export async function cancelTikTokPublish(): Promise<never> {
  throw new TokMetricError(
    405,
    "TIKTOK_CANCELLATION_NOT_SUPPORTED",
    "TikTok does not document a general cancellation operation after Direct Post initialization.",
  );
}
