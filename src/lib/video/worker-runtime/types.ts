export type VideoWorkerEnvironment = Record<string, string | undefined>;

export type VideoWorkerJob = {
  renderJobId: string;
  workspaceId: string;
  contentId: string;
  contentVersionId: string;
  promptId: string;
  state: "QUEUED" | "RUNNING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
};

export type VideoOutputDescriptor = {
  fileName: string;
  subfolder: string;
  type: string;
  mimeType: "video/mp4" | "video/webm" | "video/quicktime";
};

export type VideoWorkerConfig = {
  gemBaseUrl: string;
  callbackSecret: string;
  comfyBaseUrl: string;
  comfyBearerToken?: string;
  storageBaseUrl: string;
  storageKey: string;
  storageBucket: string;
  storagePrefix: string;
  batchSize: number;
  pollIntervalMs: number;
  maxFileBytes: number;
  requestTimeoutMs: number;
  transferTimeoutMs: number;
};

export type DownloadedVideo = {
  tempDirectory: string;
  tempPath: string;
  fileName: string;
  mimeType: VideoOutputDescriptor["mimeType"];
  fileSize: number;
  checksumSha256: string;
};

export class VideoWorkerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "VideoWorkerError";
  }
}
