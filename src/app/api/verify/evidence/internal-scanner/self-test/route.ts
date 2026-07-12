import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { runGemStaticEvidenceScan } from "@/lib/kyc/evidence-static-scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function digest(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

function scan(
  bytes: Buffer,
  mimeType: "application/pdf" | "image/png" | "image/jpeg",
  expectedSha256 = digest(bytes),
) {
  return runGemStaticEvidenceScan({
    bytes,
    mimeType,
    expectedSha256,
    expectedFileSizeBytes: bytes.length,
  });
}

function safePdf(extra = "") {
  return Buffer.from(
    `%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n${extra}\nstartxref\n0\n%%EOF\n`,
    "latin1",
  );
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, Buffer.from(type, "ascii"), data, Buffer.alloc(4)]);
}

function safePng() {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0);
  header.writeUInt32BE(2, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    signature,
    pngChunk("IHDR", header),
    pngChunk("IDAT", Buffer.from([0x00])),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function safeJpeg() {
  return Buffer.from([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x11, 0x08,
    0x00, 0x02,
    0x00, 0x02,
    0x03,
    0x01, 0x11, 0x00,
    0x02, 0x11, 0x00,
    0x03, 0x11, 0x00,
    0xff, 0xda,
    0xff, 0xd9,
  ]);
}

export async function GET() {
  const pdf = safePdf();
  const png = safePng();
  const jpeg = safeJpeg();

  const cases = [
    {
      id: "clean-pdf",
      expected: "passed",
      actual: scan(pdf, "application/pdf").status,
    },
    {
      id: "active-pdf",
      expected: "failed",
      actual: scan(
        safePdf("2 0 obj << /JavaScript (alert) >> endobj"),
        "application/pdf",
      ).status,
    },
    {
      id: "encrypted-pdf",
      expected: "manual_review",
      actual: scan(
        safePdf("trailer << /Encrypt 2 0 R >>"),
        "application/pdf",
      ).status,
    },
    {
      id: "checksum-tamper",
      expected: "failed",
      actual: scan(pdf, "application/pdf", "0".repeat(64)).status,
    },
    {
      id: "clean-png",
      expected: "passed",
      actual: scan(png, "image/png").status,
    },
    {
      id: "png-polyglot",
      expected: "failed",
      actual: scan(
        Buffer.concat([png, Buffer.from("PK\u0003\u0004payload", "latin1")]),
        "image/png",
      ).status,
    },
    {
      id: "clean-jpeg",
      expected: "passed",
      actual: scan(jpeg, "image/jpeg").status,
    },
    {
      id: "jpeg-trailing-data",
      expected: "failed",
      actual: scan(
        Buffer.concat([jpeg, Buffer.from("MZpayload", "latin1")]),
        "image/jpeg",
      ).status,
    },
  ].map((testCase) => ({
    ...testCase,
    passed: testCase.actual === testCase.expected,
  }));

  const passed = cases.every((testCase) => testCase.passed);

  return NextResponse.json(
    {
      ok: passed,
      service: "gem-verify-first-party-scanner-self-test",
      engine: "gem-static-safety-v1",
      assurance: "structural_file_safety_only",
      antivirusEquivalent: false,
      biometricAnalysis: false,
      evaluatedAt: new Date().toISOString(),
      summary: {
        passed: cases.filter((testCase) => testCase.passed).length,
        total: cases.length,
      },
      cases,
    },
    {
      status: passed ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
