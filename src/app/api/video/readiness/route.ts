import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { getVideoReadiness, probeComfyUi } from "@/lib/video/comfyui";

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const readiness = getVideoReadiness();
  if (!readiness.directWorkerReady) {
    return NextResponse.json(
      {
        ok: false,
        ...readiness,
        code: "COMFYUI_NOT_CONFIGURED",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const probe = await probeComfyUi();
    const contentReady = probe.ok && readiness.contentRenderingReady;
    return NextResponse.json(
      {
        ok: contentReady,
        ...readiness,
        providerStatus: probe.status,
        responseFormat: probe.responseFormat,
        diagnostic: probe.diagnostic,
        code: !probe.ok
          ? "COMFYUI_UNHEALTHY"
          : readiness.contentRenderingReady
            ? undefined
            : "VIDEO_RENDER_WORKFLOW_NOT_CONFIGURED",
      },
      {
        status: !probe.ok ? 502 : contentReady ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        ...readiness,
        code: message === "COMFYUI_TIMEOUT" ? "COMFYUI_TIMEOUT" : "COMFYUI_UNREACHABLE",
        error: message,
      },
      {
        status: message === "COMFYUI_TIMEOUT" ? 504 : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
