export const TIKTOK_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export type TikTokVideoMimeType = (typeof TIKTOK_VIDEO_MIME_TYPES)[number];

export const TIKTOK_PRIVACY_LEVELS = [
  "PUBLIC_TO_EVERYONE",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "SELF_ONLY",
] as const;

export type TikTokPrivacyLevel = (typeof TIKTOK_PRIVACY_LEVELS)[number];
export type TikTokVideoSource = "FILE_UPLOAD" | "PULL_FROM_URL";

export type TikTokCreatorInfo = {
  creatorAvatarUrl: string | null;
  creatorUsername: string;
  creatorNickname: string;
  privacyLevelOptions: TikTokPrivacyLevel[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxVideoPostDurationSec: number;
};

export type TikTokChunkPlan = {
  videoSize: number;
  chunkSize: number;
  totalChunkCount: number;
};

export type TikTokPublishStatus = {
  status: string;
  failReason: string | null;
  publiclyAvailablePostIds: string[];
  uploadedBytes: number | null;
  downloadedBytes: number | null;
  isFinal: boolean;
  succeeded: boolean;
};

const FIVE_MIB = 5 * 1024 * 1024;
const SIXTY_FOUR_MIB = 64 * 1024 * 1024;
const FOUR_GIB = 4 * 1024 * 1024 * 1024;

export function calculateTikTokChunkPlan(videoSize: number): TikTokChunkPlan {
  if (!Number.isSafeInteger(videoSize) || videoSize <= 0) {
    throw new Error("Video size must be a positive safe integer.");
  }
  if (videoSize > FOUR_GIB) {
    throw new Error("TikTok video uploads cannot exceed 4 GB.");
  }

  if (videoSize < FIVE_MIB) {
    return { videoSize, chunkSize: videoSize, totalChunkCount: 1 };
  }

  const chunkSize = Math.min(videoSize, SIXTY_FOUR_MIB);
  const totalChunkCount = Math.max(1, Math.floor(videoSize / chunkSize));
  if (totalChunkCount > 1000) {
    throw new Error("TikTok upload would exceed the maximum chunk count.");
  }

  return { videoSize, chunkSize, totalChunkCount };
}

export function chunkByteRange(plan: TikTokChunkPlan, index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= plan.totalChunkCount) {
    throw new Error("Chunk index is outside the upload plan.");
  }

  const start = index * plan.chunkSize;
  const end = index === plan.totalChunkCount - 1
    ? plan.videoSize - 1
    : Math.min(plan.videoSize - 1, start + plan.chunkSize - 1);

  return { start, end, length: end - start + 1 };
}
