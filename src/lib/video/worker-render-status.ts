import { latestVideoRenderJobForContent } from "@/lib/video/store";

export async function latestWorkerContentRender(input: {
  workspaceId: string;
  contentId: string;
}) {
  const record = await latestVideoRenderJobForContent(input);
  if (!record) return null;
  return {
    renderJobId: record.id,
    promptId: record.externalPromptId,
    status: record.state.toLowerCase(),
    outputs: record.outputManifest,
    error: record.errorCode
      ? {
          type: record.errorCode,
          message: record.errorMessage,
        }
      : undefined,
    queuedAt: record.createdAt,
    finalizedAt: record.finalizedAt,
    dispatchMode: "trusted-worker" as const,
  };
}
