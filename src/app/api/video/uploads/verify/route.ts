import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRenderedUpload } from "@/lib/video/content-rendering";
import { requireTrustedVideoWorker } from "@/lib/video/worker-auth";
import {
  correlationId,
  parseJson,
  tokMetricErrorResponse,
} from "@/lib/tokmetric/security";

const requestSchema = z.object({
  renderJobId: z.string().uuid(),
  storageRef: z.string().url().max(2000),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(["video/mp4", "video/webm", "video/quicktime"]),
  fileSize: z.number().int().positive().max(1024 * 1024 * 1024),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
});

type UploadPayload = {
  renderJobId: string;
  storageRef: string;
  fileName: string;
  mimeType: "video/mp4" | "video/webm" | "video/quicktime";
  fileSize: number;
  checksumSha256: string;
};

export async function POST(request: NextRequest) {
  const cid = correlationId(request);
  try {
    requireTrustedVideoWorker(request);
    const input = (await parseJson(request, requestSchema)) as UploadPayload;
    const result = await verifyRenderedUpload({
      ...input,
      correlationId: cid,
    });
    return NextResponse.json(
      { ok: true, correlationId: cid, data: result },
      { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
