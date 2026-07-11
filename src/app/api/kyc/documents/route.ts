import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-helpers";
import { SECURE_DOCUMENT_UPLOAD_ACTIVE } from "@/lib/kyc/capabilities";

export async function POST() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  if (SECURE_DOCUMENT_UPLOAD_ACTIVE) {
    return NextResponse.json(
      {
        ok: false,
        code: "DOCUMENT_UPLOAD_HANDLER_NOT_IMPLEMENTED",
        error: "Document upload cannot be accepted without the production handler.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

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
