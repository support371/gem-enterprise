"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  Square,
  UploadCloud,
} from "lucide-react";
import {
  chunkByteRange,
  type TikTokChunkPlan,
  type TikTokCreatorInfo,
  type TikTokPrivacyLevel,
  type TikTokPublishStatus,
  type TikTokVideoSource,
} from "@/lib/tokmetric/publishing/types";

type PublishingContext = {
  gate: {
    environment: "sandbox" | "production";
    productionEnabled: boolean;
    sandboxEnabled: boolean;
    enabled: boolean;
    mode: "production" | "sandbox" | "disabled";
  };
  verifiedMediaHosts: string[];
  workspaces: Array<{
    id: string;
    name: string;
    slug: string;
    globalEmergencyLock: boolean;
    publishingDisabled: boolean;
    connectors: Array<{
      id: string;
      displayName: string;
      externalAccountId: string | null;
      grantedScopes: string[];
      state: string;
    }>;
    contents: Array<{
      id: string;
      title: string;
      currentVersionId: string | null;
      state: string;
    }>;
    publishJobs: Array<{
      id: string;
      contentId: string | null;
      connectorId: string | null;
      internalState: string;
      externalState: string;
      externalRequestId: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
};

type InitResult = {
  jobId: string;
  publishId: string;
  uploadUrl: string | null;
  chunkPlan: TikTokChunkPlan | null;
  source: TikTokVideoSource;
  processingNotice: string;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.ok || payload.data === undefined) {
    throw new Error(payload?.error?.message ?? "The request could not be completed.");
  }
  return payload.data;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    const finish = (value?: number) => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      resolve(value);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => finish(Number.isFinite(video.duration) ? video.duration : undefined);
    video.onerror = () => finish(undefined);
    video.src = objectUrl;
  });
}

export function TokMetricVideoPublisher() {
  const [context, setContext] = useState<PublishingContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [workspaceId, setWorkspaceId] = useState("");
  const [connectorId, setConnectorId] = useState("");
  const [contentId, setContentId] = useState("");
  const [creator, setCreator] = useState<TikTokCreatorInfo | null>(null);
  const [source, setSource] = useState<TikTokVideoSource>("FILE_UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number | undefined>();
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<TikTokPrivacyLevel>("SELF_ONLY");
  const [disableComment, setDisableComment] = useState(false);
  const [disableDuet, setDisableDuet] = useState(false);
  const [disableStitch, setDisableStitch] = useState(false);
  const [brandContentToggle, setBrandContentToggle] = useState(false);
  const [brandOrganicToggle, setBrandOrganicToggle] = useState(false);
  const [isAigc, setIsAigc] = useState(false);
  const [consentToUpload, setConsentToUpload] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [musicRightsConfirmed, setMusicRightsConfirmed] = useState(false);
  const [processingNoticeAccepted, setProcessingNoticeAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeJob, setActiveJob] = useState<{ jobId: string; publishId: string } | null>(null);
  const [latestStatus, setLatestStatus] = useState<(TikTokPublishStatus & { internalState: string; externalState: string }) | null>(null);

  const workspace = useMemo(
    () => context?.workspaces.find((item) => item.id === workspaceId) ?? null,
    [context, workspaceId],
  );

  async function loadContext() {
    setLoadingContext(true);
    setError("");
    try {
      const data = await api<PublishingContext>("/api/tokmetric/publishing/context");
      setContext(data);
      const first = data.workspaces[0];
      if (first) {
        setWorkspaceId((current) => current || first.id);
        setConnectorId((current) => current || first.connectors[0]?.id || "");
        setContentId((current) => current || first.contents[0]?.id || "");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load publishing context.");
    } finally {
      setLoadingContext(false);
    }
  }

  useEffect(() => {
    void loadContext();
  }, []);

  function selectWorkspace(nextWorkspaceId: string) {
    setWorkspaceId(nextWorkspaceId);
    const next = context?.workspaces.find((item) => item.id === nextWorkspaceId);
    setConnectorId(next?.connectors[0]?.id ?? "");
    setContentId(next?.contents[0]?.id ?? "");
    setCreator(null);
    setActiveJob(null);
    setLatestStatus(null);
  }

  async function queryCreator() {
    if (!workspaceId || !connectorId) return;
    setBusy(true);
    setError("");
    setMessage("Querying the latest TikTok creator settings…");
    try {
      const data = await api<TikTokCreatorInfo>("/api/tokmetric/publishing/creator-info", {
        method: "POST",
        body: JSON.stringify({ workspaceId, connectorId }),
      });
      setCreator(data);
      const preferred = context?.gate.mode === "sandbox" && data.privacyLevelOptions.includes("SELF_ONLY")
        ? "SELF_ONLY"
        : data.privacyLevelOptions[0];
      if (preferred) setPrivacyLevel(preferred);
      setDisableComment(data.commentDisabled);
      setDisableDuet(data.duetDisabled);
      setDisableStitch(data.stitchDisabled);
      setMessage(`Connected as ${data.creatorNickname} (@${data.creatorUsername}).`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Creator settings could not be loaded.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setDurationSec(undefined);
    if (nextFile) {
      const duration = await getVideoDuration(nextFile);
      setDurationSec(duration);
    }
  }

  async function uploadFileToTikTok(uploadUrl: string, plan: TikTokChunkPlan, selectedFile: File) {
    for (let index = 0; index < plan.totalChunkCount; index += 1) {
      const range = chunkByteRange(plan, index);
      const chunk = selectedFile.slice(range.start, range.end + 1, selectedFile.type);
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
          "Content-Range": `bytes ${range.start}-${range.end}/${plan.videoSize}`,
        },
        body: chunk,
      });
      if (![200, 201, 206].includes(response.status)) {
        throw new Error(`TikTok rejected video chunk ${index + 1} with HTTP ${response.status}.`);
      }
      setProgress(Math.round(((index + 1) / plan.totalChunkCount) * 100));
    }
  }

  async function pollStatus(jobId: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const status = await api<TikTokPublishStatus & { internalState: string; externalState: string }>(
        "/api/tokmetric/publishing/status",
        { method: "POST", body: JSON.stringify({ workspaceId, jobId }) },
      );
      setLatestStatus(status);
      setMessage(`TikTok status: ${status.status}. Processing can take several minutes.`);
      if (status.isFinal) return status;
      await sleep(5000);
    }
    throw new Error("TikTok is still processing the video. Use Refresh status to continue checking.");
  }

  async function startPublish() {
    if (!creator) {
      setError("Query the TikTok creator settings before publishing.");
      return;
    }
    if (!workspaceId || !connectorId || !contentId) {
      setError("Select a workspace, connected account, and approved content item.");
      return;
    }
    if (source === "FILE_UPLOAD" && !file) {
      setError("Select a video file.");
      return;
    }
    if (source === "PULL_FROM_URL" && !videoUrl) {
      setError("Enter a video URL from a verified TikTok URL property.");
      return;
    }

    setBusy(true);
    setError("");
    setProgress(0);
    setLatestStatus(null);
    setMessage("Initializing the TikTok publishing request…");
    const idempotencyKey = crypto.randomUUID();

    try {
      const initialized = await api<InitResult>("/api/tokmetric/publishing/init", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          workspaceId,
          contentId,
          connectorId,
          title,
          privacyLevel,
          disableComment,
          disableDuet,
          disableStitch,
          brandContentToggle,
          brandOrganicToggle,
          isAigc,
          source,
          file: file ? { name: file.name, mimeType: file.type, size: file.size, durationSec } : undefined,
          videoUrl: source === "PULL_FROM_URL" ? videoUrl : undefined,
          consentToUpload,
          rightsConfirmed,
          musicRightsConfirmed,
          processingNoticeAccepted,
        }),
      });
      setActiveJob({ jobId: initialized.jobId, publishId: initialized.publishId });

      if (initialized.source === "FILE_UPLOAD") {
        if (!file || !initialized.uploadUrl || !initialized.chunkPlan) {
          throw new Error("TikTok did not return a complete file-upload session.");
        }
        setMessage("Uploading the video directly to TikTok…");
        await uploadFileToTikTok(initialized.uploadUrl, initialized.chunkPlan, file);
        await api("/api/tokmetric/publishing/upload-complete", {
          method: "POST",
          body: JSON.stringify({ workspaceId, jobId: initialized.jobId }),
        });
      }

      setMessage(initialized.processingNotice);
      const status = await pollStatus(initialized.jobId);
      setMessage(status.succeeded
        ? "TikTok confirmed the publishing workflow completed."
        : `TikTok could not publish the video: ${status.failReason ?? status.status}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Publishing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshStatus() {
    if (!activeJob) return;
    setBusy(true);
    setError("");
    try {
      const status = await api<TikTokPublishStatus & { internalState: string; externalState: string }>(
        "/api/tokmetric/publishing/status",
        { method: "POST", body: JSON.stringify({ workspaceId, jobId: activeJob.jobId }) },
      );
      setLatestStatus(status);
      setMessage(`TikTok status: ${status.status}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Status refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelPublish() {
    if (!activeJob) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/tokmetric/publishing/cancel", {
        method: "POST",
        body: JSON.stringify({ workspaceId, jobId: activeJob.jobId }),
      });
      setMessage("Cancellation was requested from TikTok.");
      setLatestStatus(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Cancellation failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loadingContext) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-white/60">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading video publishing controls…
      </div>
    );
  }

  if (!context) {
    return (
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-6 text-sm text-amber-100">
        Sign in with an authorized GEM Enterprise account to use the live publishing workflow.
      </div>
    );
  }

  const blocked = !context.gate.enabled || workspace?.globalEmergencyLock || workspace?.publishingDisabled;
  const allConfirmed = consentToUpload && rightsConfirmed && musicRightsConfirmed && processingNoticeAccepted;

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Live review workflow</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Publish a real video through TikTok</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
            Creator settings are queried immediately before posting. The video is sent only after you select privacy and interaction settings and confirm upload, ownership, music rights, and processing consent.
          </p>
        </div>
        <div className={`rounded-xl border px-4 py-3 text-sm ${blocked ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100" : "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100"}`}>
          {blocked ? <AlertTriangle className="mr-2 inline h-4 w-4" /> : <CheckCircle2 className="mr-2 inline h-4 w-4" />}
          {context.gate.mode.toUpperCase()} · {blocked ? "Publishing blocked" : "Publishing enabled"}
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <label className="text-sm text-white/65">
          Workspace
          <select value={workspaceId} onChange={(event) => selectWorkspace(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white">
            <option value="">Select workspace</option>
            {context.workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-white/65">
          TikTok account connector
          <select value={connectorId} onChange={(event) => { setConnectorId(event.target.value); setCreator(null); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white">
            <option value="">Select connected account</option>
            {workspace?.connectors.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {item.externalAccountId ?? "account"}</option>)}
          </select>
        </label>
        <label className="text-sm text-white/65">
          Approved content version
          <select value={contentId} onChange={(event) => setContentId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white">
            <option value="">Select approved content</option>
            {workspace?.contents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void queryCreator()} disabled={busy || !connectorId} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#071019] disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 inline h-4 w-4" />}
          Query creator settings
        </button>
        {creator && <span className="text-sm text-white/60">Posting account: <strong className="text-white">{creator.creatorNickname}</strong> (@{creator.creatorUsername}) · max {creator.maxVideoPostDurationSec}s</span>}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#091019] p-5">
          <div className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
            {(["FILE_UPLOAD", "PULL_FROM_URL"] as TikTokVideoSource[]).map((value) => (
              <button key={value} type="button" onClick={() => setSource(value)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${source === value ? "bg-cyan-300 text-[#071019]" : "text-white/55"}`}>
                {value === "FILE_UPLOAD" ? "Local video file" : "Verified video URL"}
              </button>
            ))}
          </div>

          {source === "FILE_UPLOAD" ? (
            <label className="block text-sm text-white/65">
              MP4, MOV, or WebM video
              <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => void selectFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-white/60" />
              {file && <span className="mt-2 block text-xs text-white/45">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB{durationSec ? ` · ${durationSec.toFixed(1)}s` : ""}</span>}
            </label>
          ) : (
            <label className="block text-sm text-white/65">
              HTTPS video URL
              <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://verified-domain.example/video.mp4" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white" />
              <span className="mt-2 block text-xs text-white/45">Allowed properties: {context.verifiedMediaHosts.join(", ") || "none configured"}</span>
            </label>
          )}

          <label className="block text-sm text-white/65">
            Editable caption, hashtags, and mentions
            <textarea value={title} onChange={(event) => setTitle(event.target.value)} maxLength={2200} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white" placeholder="Write the final TikTok caption here…" />
            <span className="mt-1 block text-right text-xs text-white/35">{title.length}/2200</span>
          </label>

          <label className="block text-sm text-white/65">
            Privacy level
            <select value={privacyLevel} onChange={(event) => setPrivacyLevel(event.target.value as TikTokPrivacyLevel)} disabled={!creator} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white disabled:opacity-40">
              {(creator?.privacyLevelOptions ?? ["SELF_ONLY"]).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
          </label>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#091019] p-5">
          <div>
            <h3 className="font-semibold text-white">TikTok interaction settings</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                ["Disable comments", disableComment, setDisableComment, creator?.commentDisabled],
                ["Disable Duet", disableDuet, setDisableDuet, creator?.duetDisabled],
                ["Disable Stitch", disableStitch, setDisableStitch, creator?.stitchDisabled],
              ].map(([label, checked, setter, forced]) => (
                <label key={String(label)} className="flex items-start gap-2 rounded-xl border border-white/10 p-3 text-sm text-white/60">
                  <input type="checkbox" checked={Boolean(checked)} disabled={Boolean(forced)} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="mt-0.5" />
                  {label}{forced ? " (account setting)" : ""}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">Content disclosure</h3>
            <div className="mt-3 space-y-3">
              <label className="flex gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/60"><input type="checkbox" checked={brandContentToggle} onChange={(event) => setBrandContentToggle(event.target.checked)} className="mt-0.5" /> Paid partnership promoting another business</label>
              <label className="flex gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/60"><input type="checkbox" checked={brandOrganicToggle} onChange={(event) => setBrandOrganicToggle(event.target.checked)} className="mt-0.5" /> Promotes the creator&apos;s own business</label>
              <label className="flex gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/60"><input type="checkbox" checked={isAigc} onChange={(event) => setIsAigc(event.target.checked)} className="mt-0.5" /> Video contains AI-generated content</label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">Required confirmation</h3>
            <div className="mt-3 space-y-3">
              <label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={consentToUpload} onChange={(event) => setConsentToUpload(event.target.checked)} className="mt-0.5" /> I expressly consent to send this selected video to TikTok now.</label>
              <label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-0.5" /> I own or have permission to use and publish the video.</label>
              <label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={musicRightsConfirmed} onChange={(event) => setMusicRightsConfirmed(event.target.checked)} className="mt-0.5" /> I have the necessary rights for music and audio in the video.</label>
              <label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={processingNoticeAccepted} onChange={(event) => setProcessingNoticeAccepted(event.target.checked)} className="mt-0.5" /> I understand TikTok processing and moderation may take several minutes or longer.</label>
            </div>
          </div>
        </div>
      </div>

      {(message || error || progress > 0 || latestStatus) && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          {message && <p className="text-sm text-cyan-100">{message}</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
          {progress > 0 && progress < 100 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} /></div>}
          {latestStatus && <p className="mt-2 text-xs text-white/45">Internal: {latestStatus.internalState} · External: {latestStatus.externalState} · Uploaded: {latestStatus.uploadedBytes ?? "—"} bytes</p>}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => void startPublish()} disabled={busy || blocked || !creator || !allConfirmed} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#071019] disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : source === "FILE_UPLOAD" ? <UploadCloud className="mr-2 inline h-4 w-4" /> : <Send className="mr-2 inline h-4 w-4" />}
          Send video to TikTok
        </button>
        <button type="button" onClick={() => void refreshStatus()} disabled={busy || !activeJob} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 disabled:opacity-40"><RefreshCw className="mr-2 inline h-4 w-4" />Refresh status</button>
        <button type="button" onClick={() => void cancelPublish()} disabled={busy || !activeJob} className="rounded-xl border border-red-300/20 px-4 py-3 text-sm font-semibold text-red-200 disabled:opacity-40"><Square className="mr-2 inline h-4 w-4" />Cancel</button>
      </div>
    </section>
  );
}
