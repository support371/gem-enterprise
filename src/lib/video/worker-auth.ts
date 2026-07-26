import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { TokMetricError } from "@/lib/tokmetric/security";

export function requireVideoRenderWorker(request: NextRequest) {
  const configured = process.env.VIDEO_RENDER_CALLBACK_SECRET?.trim();
  if (!configured) {
    throw new TokMetricError(
      503,
      "VIDEO_RENDER_CALLBACK_NOT_CONFIGURED",
      "Trusted video-render worker access is not configured.",
    );
  }

  const header = request.headers.get("authorization")?.trim();
  if (!header?.startsWith("Bearer ")) {
    throw new TokMetricError(
      401,
      "VIDEO_RENDER_CALLBACK_UNAUTHORIZED",
      "Video-render worker authentication failed.",
    );
  }

  const supplied = header.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(configured);
  const suppliedBuffer = Buffer.from(supplied);
  const authorized =
    expectedBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!authorized) {
    throw new TokMetricError(
      401,
      "VIDEO_RENDER_CALLBACK_UNAUTHORIZED",
      "Video-render worker authentication failed.",
    );
  }
}
