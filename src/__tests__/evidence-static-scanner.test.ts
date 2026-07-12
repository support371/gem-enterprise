import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { runGemStaticEvidenceScan } from "@/lib/kyc/evidence-static-scanner";

function digest(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

function scan(bytes: Buffer, mimeType: "application/pdf" | "image/png" | "image/jpeg") {
  return runGemStaticEvidenceScan({
    bytes,
    mimeType,
    expectedSha256: digest(bytes),
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

describe("GEM first-party static evidence scanner", () => {
  it("passes a structurally safe PDF without claiming antivirus equivalence", () => {
    const result = scan(safePdf(), "application/pdf");

    expect(result.status).toBe("passed");
    expect(result.engine).toBe("gem-static-safety-v1");
    expect(result.details.antivirusEquivalent).toBe(false);
    expect(result.findings).toEqual([]);
  });

  it("rejects active JavaScript content in a PDF", () => {
    const result = scan(safePdf("2 0 obj << /JavaScript (alert) >> endobj"), "application/pdf");

    expect(result.status).toBe("failed");
    expect(result.findings.some((finding) => finding.code === "PDF_JAVASCRIPT")).toBe(true);
  });

  it("routes encrypted PDFs to manual review", () => {
    const result = scan(safePdf("trailer << /Encrypt 2 0 R >>"), "application/pdf");

    expect(result.status).toBe("manual_review");
    expect(result.findings.some((finding) => finding.code === "PDF_ENCRYPTED")).toBe(true);
  });

  it("rejects checksum tampering independently of file structure", () => {
    const bytes = safePdf();
    const result = runGemStaticEvidenceScan({
      bytes,
      mimeType: "application/pdf",
      expectedSha256: "0".repeat(64),
      expectedFileSizeBytes: bytes.length,
    });

    expect(result.status).toBe("failed");
    expect(result.findings.some((finding) => finding.code === "SHA256_MISMATCH")).toBe(true);
  });

  it("passes a bounded PNG and rejects appended polyglot data", () => {
    const clean = safePng();
    expect(scan(clean, "image/png").status).toBe("passed");

    const appended = Buffer.concat([clean, Buffer.from("PK\u0003\u0004payload", "latin1")]);
    const result = scan(appended, "image/png");
    expect(result.status).toBe("failed");
    expect(result.findings.some((finding) => finding.code === "PNG_TRAILING_DATA")).toBe(true);
  });

  it("passes a bounded JPEG and rejects content after its terminal marker", () => {
    const clean = safeJpeg();
    expect(scan(clean, "image/jpeg").status).toBe("passed");

    const appended = Buffer.concat([clean, Buffer.from("MZpayload", "latin1")]);
    const result = scan(appended, "image/jpeg");
    expect(result.status).toBe("failed");
    expect(result.findings.some((finding) => finding.code === "JPEG_TRAILING_DATA")).toBe(true);
  });
});
