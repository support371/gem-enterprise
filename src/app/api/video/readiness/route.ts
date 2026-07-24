import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getVideoReadiness, probeComfyUi } from "@/lib/video/comfyui";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readiness = getVideoReadiness();
  if (!readiness.configured) {
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
    return NextResponse.json(
      {
        ok: probe.ok,
        ...readiness,
        providerStatus: probe.status,
        system: probe.body,
      },
      { status: probe.ok ? 200 : 502, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        ...readiness,
        code: "COMFYUI_UNREACHABLE",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
