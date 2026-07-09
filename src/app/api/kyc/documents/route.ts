import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-helpers";

/**
 * Production document intake is intentionally disabled until a complete private
 * object-storage flow is available. The previous implementation created only a
 * database metadata row and did not store, scan, or verify the actual file. That
 * could make an application appear to contain documents when no document existed.
 */
export async function POST() {
  const gate = await requireSession();
  if (!gate.ok) return (gate as { ok: false; response: NextResponse }).response;

  return NextResponse.json(
    {
      ok: false,
      code: "SECURE_DOCUMENT_UPLOAD_NOT_ACTIVE",
      error:
        "Secure document upload is not active. Do not transmit identity or financial documents through this endpoint.",
      requirements: [
        "private object storage",
        "short-lived upload authorization",
        "file-signature and size validation",
        "malware scanning and quarantine",
        "reviewer access controls and audit logging",
        "retention and deletion enforcement",
      ],
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": "86400",
      },
    },
  );
}
