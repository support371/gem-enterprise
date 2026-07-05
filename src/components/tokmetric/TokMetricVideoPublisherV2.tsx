"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Send, UploadCloud } from "lucide-react";
import {
  chunkByteRange,
  type TikTokChunkPlan,
  type TikTokCreatorInfo,
  type TikTokPrivacyLevel,
  type TikTokPublishStatus,
  type TikTokVideoSource,
} from "@/lib/tokmetric/publishing/types";

type WorkspaceContext = {
  id: string;
  name: string;
  globalEmergencyLock: boolean;
  publishingDisabled: boolean;
  connectors: Array<{
    id: string;
    displayName: string;
    externalAccountId: string | null;
    grantedScopes: string[];
  }>;
  contents: Array<{ id: string; title: string }>;
};

type PublishingContext = {
  gate: {
    environment: "sandbox" | "production";
    enabled: boolean;
    mode: "production" | "sandbox" | "disabled";
  };
  verifiedMediaHosts: string[];
  workspaces: WorkspaceContext[];
};

type InitResult = {
  jobId: string;
  publishId: string;
  uploadUrl: string | null;
  chunkPlan: TikTokChunkPlan | null;
  source: TikTokVideoSource;
  processingNotice: string;
};

type StatusResult = TikTokPublishStatus & {
  jobId: string;
  internalState: string;
  externalState: string;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};

type ToggleControl = {
  label: string;
  checked: boolean;
  forced: boolean;
  setChecked: (value: boolean) => void;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.ok || payload.data === undefined) {
    throw new Error(payload?.error?.message ?? "The request could not be completed.");
  }
  return payload.data;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function readDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    const finish = (duration?: number) => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      resolve(duration);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => finish(Number.isFinite(video.duration) ? video.duration : undefined);
    video.onerror = () => finish(undefined);
    video.src = objectUrl;
  });
}

async function uploadChunks(
  uploadUrl: string,
  plan: TikTokChunkPlan,
  file: File,
  reportProgress: (percent: number) => void,
) {
  for (let index = 0; index < plan.totalChunkCount; index += 1) {
    const range = chunkByteRange(plan, index);
    const chunk = file.slice(range.start, range.end + 1, file.type);
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Range": `bytes ${range.start}-${range.end}/${plan.videoSize}`,
      },
      body: chunk,
    });
    if (![200, 201, 206].includes(response.status)) {
      throw new Error(`TikTok rejected upload chunk ${index + 1} with HTTP ${response.status}.`);
    }
    reportProgress(Math.round(((index + 1) / plan.totalChunkCount) * 100));
  }
}

export function TokMetricVideoPublisherV2() {
  const [context, setContext] = useState<PublishingContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
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
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const workspace = useMemo(
    () => context?.workspaces.find((item) => item.id === workspaceId) ?? null,
    [context, workspaceId],
  );

  const loadContext = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<PublishingContext>("/api/tokmetric/publishing/context");
      setContext(data);
      const initial = data.workspaces[0];
      if (initial) {
        setWorkspaceId(initial.id);
        setConnectorId(initial.connectors[0]?.id ?? "");
        setContentId(initial.contents[0]?.id ?? "");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Publishing context could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const interactionControls: ToggleControl[] = [
    {
      label: "Disable comments",
      checked: disableComment,
      forced: creator?.commentDisabled ?? false,
      setChecked: setDisableComment,
    },
    {
      label: "Disable Duet",
      checked: disableDuet,
      forced: creator?.duetDisabled ?? false,
      setChecked: setDisableDuet,
    },
    {
      label: "Disable Stitch",
      checked: disableStitch,
      forced: creator?.stitchDisabled ?? false,
      setChecked: setDisableStitch,
    },
  ];

  const blocked = !context?.gate.enabled || Boolean(workspace?.globalEmergencyLock) || Boolean(workspace?.publishingDisabled);
  const confirmationsComplete = consentToUpload && rightsConfirmed && musicRightsConfirmed && processingNoticeAccepted;

  function changeWorkspace(nextWorkspaceId: string) {
    const next = context?.workspaces.find((item) => item.id === nextWorkspaceId);
    setWorkspaceId(nextWorkspaceId);
    setConnectorId(next?.connectors[0]?.id ?? "");
    setContentId(next?.contents[0]?.id ?? "");
    setCreator(null);
    setActiveJobId(null);
    setPublishId(null);
    setStatus(null);
  }

  async function queryCreator() {
    if (!workspaceId || !connectorId) return;
    setBusy(true);
    setError("");
    setMessage("Querying TikTok creator settings…");
    try {
      const data = await api<TikTokCreatorInfo>("/api/tokmetric/publishing/creator-info", {
        method: "POST",
        body: JSON.stringify({ workspaceId, connectorId }),
      });
      setCreator(data);
      const nextPrivacy = context?.gate.mode === "sandbox" && data.privacyLevelOptions.includes("SELF_ONLY")
        ? "SELF_ONLY"
        : data.privacyLevelOptions[0];
      if (nextPrivacy) setPrivacyLevel(nextPrivacy);
      setDisableComment(data.commentDisabled);
      setDisableDuet(data.duetDisabled);
      setDisableStitch(data.stitchDisabled);
      setMessage(`Connected as ${data.creatorNickname} (@${data.creatorUsername}).`);
    } catch (requestError) {
      setMessage("");
      setError(requestError instanceof Error ? requestError.message : "Creator settings could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    setDurationSec(undefined);
    if (nextFile) setDurationSec(await readDuration(nextFile));
  }

  async function refreshStatus(jobId = activeJobId) {
    if (!jobId || !workspaceId) return null;
    const next = await api<StatusResult>("/api/tokmetric/publishing/status", {
      method: "POST",
      body: JSON.stringify({ workspaceId, jobId }),
    });
    setStatus(next);
    setMessage(`TikTok status: ${next.status}. Processing can take several minutes.`);
    return next;
  }

  async function pollStatus(jobId: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const next = await refreshStatus(jobId);
      if (next?.isFinal) return next;
      await wait(5000);
    }
    throw new Error("TikTok is still processing the video. Use Refresh status to continue checking.");
  }

  async function startPublish() {
    if (!creator) return setError("Query the latest TikTok creator settings first.");
    if (!workspaceId || !connectorId || !contentId) return setError("Select a workspace, account, and approved content item.");
    if (source === "FILE_UPLOAD" && !file) return setError("Select an MP4, MOV, or WebM video.");
    if (source === "PULL_FROM_URL" && !videoUrl) return setError("Enter a verified HTTPS video URL.");

    setBusy(true);
    setError("");
    setStatus(null);
    setProgress(0);
    setMessage("Initializing the TikTok publishing request…");
    try {
      const initialized = await api<InitResult>("/api/tokmetric/publishing/init", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
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
      setActiveJobId(initialized.jobId);
      setPublishId(initialized.publishId);

      if (initialized.source === "FILE_UPLOAD") {
        if (!file || !initialized.uploadUrl || !initialized.chunkPlan) {
          throw new Error("TikTok did not return a complete upload session.");
        }
        setMessage("Uploading the video directly to TikTok…");
        await uploadChunks(initialized.uploadUrl, initialized.chunkPlan, file, setProgress);
        await api("/api/tokmetric/publishing/upload-complete", {
          method: "POST",
          body: JSON.stringify({ workspaceId, jobId: initialized.jobId }),
        });
      }

      setMessage(initialized.processingNotice);
      const finalStatus = await pollStatus(initialized.jobId);
      if (finalStatus?.succeeded) {
        setMessage("TikTok confirmed that the publishing workflow completed.");
      } else if (finalStatus?.isFinal) {
        setError(finalStatus.failReason ?? `TikTok finished with status ${finalStatus.status}.`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Publishing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function manuallyRefreshStatus() {
    if (!activeJobId) return;
    setBusy(true);
    setError("");
    try {
      await refreshStatus(activeJobId);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Status refresh failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 p-6 text-white/60"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading video publishing controls…</div>;
  }

  if (!context) {
    return <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-6 text-amber-100">Sign in with an authorized GEM Enterprise account to use publishing.</div>;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">TikTok Direct Post workflow</p>
          <h2 className="mt-2 text-2xl font-bold">Publish a real video through TikTok</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">The selected video is transmitted only after the account settings are refreshed and every required consent is checked.</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 text-sm ${blocked ? "border-amber-300/20 bg-amber-300/10 text-amber-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"}`}>
          {blocked ? <AlertTriangle className="mr-2 inline h-4 w-4" /> : <CheckCircle2 className="mr-2 inline h-4 w-4" />}
          {context.gate.mode.toUpperCase()} · {blocked ? "Publishing blocked" : "Publishing enabled"}
        </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <label className="text-sm text-white/65">Workspace<select value={workspaceId} onChange={(event) => changeWorkspace(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white"><option value="">Select workspace</option>{context.workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm text-white/65">TikTok account<select value={connectorId} onChange={(event) => { setConnectorId(event.target.value); setCreator(null); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white"><option value="">Select connected account</option>{workspace?.connectors.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {item.externalAccountId ?? "account"}</option>)}</select></label>
        <label className="text-sm text-white/65">Approved content<select value={contentId} onChange={(event) => setContentId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091019] px-3 py-3 text-white"><option value="">Select approved content</option>{workspace?.contents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      </div>

      <button type="button" onClick={() => void queryCreator()} disabled={busy || !connectorId} className="mt-5 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#071019] disabled:opacity-40"><RefreshCw className="mr-2 inline h-4 w-4" />Query creator settings</button>
      {creator && <p className="mt-3 text-sm text-white/60">Posting as <strong className="text-white">{creator.creatorNickname}</strong> (@{creator.creatorUsername}) · maximum {creator.maxVideoPostDurationSec}s</p>}

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-white/10 bg-[#091019] p-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-1">{(["FILE_UPLOAD", "PULL_FROM_URL"] as TikTokVideoSource[]).map((value) => <button key={value} type="button" onClick={() => setSource(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${source === value ? "bg-cyan-300 text-[#071019]" : "text-white/55"}`}>{value === "FILE_UPLOAD" ? "Local video file" : "Verified video URL"}</button>)}</div>
          {source === "FILE_UPLOAD" ? <label className="block text-sm text-white/65">MP4, MOV, or WebM<input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-white/15 p-4" />{file && <span className="mt-2 block text-xs text-white/45">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB{durationSec ? ` · ${durationSec.toFixed(1)}s` : ""}</span>}</label> : <label className="block text-sm text-white/65">Verified HTTPS video URL<input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white" placeholder="https://verified-domain.example/video.mp4" /><span className="mt-2 block text-xs text-white/45">Configured properties: {context.verifiedMediaHosts.join(", ") || "none"}</span></label>}
          <label className="block text-sm text-white/65">Editable caption, hashtags, and mentions<textarea value={title} onChange={(event) => setTitle(event.target.value)} maxLength={2200} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white" /><span className="mt-1 block text-right text-xs text-white/35">{title.length}/2200</span></label>
          <label className="block text-sm text-white/65">Privacy level<select value={privacyLevel} onChange={(event) => setPrivacyLevel(event.target.value as TikTokPrivacyLevel)} disabled={!creator} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-white disabled:opacity-40">{(creator?.privacyLevelOptions ?? ["SELF_ONLY"]).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-[#091019] p-5">
          <div><h3 className="font-semibold">Interaction settings</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{interactionControls.map((control) => <label key={control.label} className="flex items-start gap-2 rounded-xl border border-white/10 p-3 text-sm text-white/60"><input type="checkbox" checked={control.checked} disabled={control.forced} onChange={(event) => control.setChecked(event.target.checked)} className="mt-0.5" />{control.label}{control.forced ? " (account setting)" : ""}</label>)}</div></div>
          <div><h3 className="font-semibold">Content disclosure</h3><div className="mt-3 space-y-3"><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={brandContentToggle} onChange={(event) => setBrandContentToggle(event.target.checked)} />Paid partnership promoting another business</label><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={brandOrganicToggle} onChange={(event) => setBrandOrganicToggle(event.target.checked)} />Promotes the creator&apos;s own business</label><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={isAigc} onChange={(event) => setIsAigc(event.target.checked)} />Contains AI-generated content</label></div></div>
          <div><h3 className="font-semibold">Required confirmations</h3><div className="mt-3 space-y-3"><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={consentToUpload} onChange={(event) => setConsentToUpload(event.target.checked)} />I expressly consent to send this selected video to TikTok now.</label><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} />I own or have permission to publish the video.</label><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={musicRightsConfirmed} onChange={(event) => setMusicRightsConfirmed(event.target.checked)} />I have the necessary music and audio rights.</label><label className="flex gap-3 text-sm text-white/60"><input type="checkbox" checked={processingNoticeAccepted} onChange={(event) => setProcessingNoticeAccepted(event.target.checked)} />I understand TikTok processing and moderation may take time.</label></div></div>
        </div>
      </div>

      {(message || error || progress > 0 || status) && <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">{message && <p className="text-sm text-cyan-100">{message}</p>}{error && <p className="mt-1 text-sm text-red-300">{error}</p>}{progress > 0 && progress < 100 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-300" style={{ width: `${progress}%` }} /></div>}{publishId && <p className="mt-2 text-xs text-white/40">TikTok publish ID: {publishId}</p>}{status && <p className="mt-1 text-xs text-white/40">Internal: {status.internalState} · External: {status.externalState} · Uploaded: {status.uploadedBytes ?? "—"} bytes</p>}</div>}

      <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void startPublish()} disabled={busy || blocked || !creator || !confirmationsComplete} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#071019] disabled:opacity-40">{busy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : source === "FILE_UPLOAD" ? <UploadCloud className="mr-2 inline h-4 w-4" /> : <Send className="mr-2 inline h-4 w-4" />}Send video to TikTok</button><button type="button" onClick={() => void manuallyRefreshStatus()} disabled={busy || !activeJobId} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 disabled:opacity-40"><RefreshCw className="mr-2 inline h-4 w-4" />Refresh status</button></div>
    </section>
  );
}
