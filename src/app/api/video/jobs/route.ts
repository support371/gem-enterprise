import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession } from "@/lib/auth";
import { queueVideoJob, videoJobInputSchema } from "@/lib/video/comfyui";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const input = videoJobInputSchema.parse(await request.json());
    const job = await queueVideoJob(input);
    return NextResponse.json({ ok: true, job }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "COMFYUI_NOT_CONFIGURED" ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ error: "Use the individual job cancellation endpoint." }, { status: 405 });
}
