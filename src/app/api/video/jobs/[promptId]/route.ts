import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelVideoJobs, getVideoJob } from "@/lib/video/comfyui";

type RouteContext = { params: Promise<{ promptId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { promptId } = await context.params;
    const job = await getVideoJob(promptId);
    return NextResponse.json({ ok: true, job }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { promptId } = await context.params;
  try {
    const result = await cancelVideoJobs();
    return NextResponse.json({ ok: true, promptId, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
