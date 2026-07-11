import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GEM_VERIFY_MAX_FILE_BYTES,
  validateEvidenceUploadMetadata,
} from "@/lib/kyc/evidence-vault";
import {
  createEvidenceStoragePath,
  createScannerCallbackToken,
  detectEvidenceMimeType,
  sanitizeEvidenceFileName,
  validateStoredEvidence,
  verifyScannerCallbackToken,
} from "@/lib/kyc/evidence-storage";

function configureScanner() {
  process.env.GEM_VERIFY_SCANNER_URL = "https://scanner.example.test/jobs";
  process.env.GEM_VERIFY_SCANNER_TOKEN = "scanner-token";
  process.env.GEM_VERIFY_SCANNER_CALLBACK_SECRET = "callback-secret-at-least-test-only";
  process.env.GEM_VERIFY_PUBLIC_BASE_URL = "https://portal.example.test";
}

afterEach(() => {
  vi.useRealTimers();
  delete process.env.GEM_VERIFY_SCANNER_URL;
  delete process.env.GEM_VERIFY_SCANNER_TOKEN;
  delete process.env.GEM_VERIFY_SCANNER_CALLBACK_SECRET;
  delete process.env.GEM_VERIFY_PUBLIC_BASE_URL;
});

describe("GEM Verify evidence vault policy", () => {
  it("accepts an approved file type within the size limit", () => {
    const result = validateEvidenceUploadMetadata({
      fileName: "identity-document.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 1024,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects unsupported file types", () => {
    const result = validateEvidenceUploadMetadata({
      fileName: "identity-document.svg",
      mimeType: "image/svg+xml",
      fileSizeBytes: 1024,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Unsupported evidence file type.");
  });

  it("rejects files larger than ten megabytes", () => {
    const result = validateEvidenceUploadMetadata({
      fileName: "identity-document.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: GEM_VERIFY_MAX_FILE_BYTES + 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Evidence file size must be between 1 byte and 10 MB.",
    );
  });

  it("rejects blank or excessively long filenames", () => {
    expect(
      validateEvidenceUploadMetadata({
        fileName: "   ",
        mimeType: "image/jpeg",
        fileSizeBytes: 1024,
      }).valid,
    ).toBe(false);

    expect(
      validateEvidenceUploadMetadata({
        fileName: `${"a".repeat(181)}.jpg`,
        mimeType: "image/jpeg",
        fileSizeBytes: 1024,
      }).valid,
    ).toBe(false);
  });

  it("removes path traversal characters and isolates every object in quarantine", () => {
    expect(sanitizeEvidenceFileName("../../passport final.pdf")).toBe(
      "passport-final.pdf",
    );
    expect(
      createEvidenceStoragePath({
        applicationId: "app_123",
        evidenceId: "evidence_456",
        fileName: "../passport final.pdf",
      }),
    ).toBe("quarantine/app_123/evidence_456/passport-final.pdf");
  });

  it("detects approved file types from signatures instead of trusting extensions", () => {
    expect(detectEvidenceMimeType(Buffer.from("%PDF-1.7\n"))).toBe(
      "application/pdf",
    );
    expect(
      detectEvidenceMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00])),
    ).toBe("image/jpeg");
    expect(
      detectEvidenceMimeType(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("image/png");
    expect(detectEvidenceMimeType(Buffer.from("<svg></svg>"))).toBeNull();
  });

  it("rejects stored evidence when the authorized size does not match", () => {
    const bytes = Buffer.from("%PDF-1.7\nexample");
    const result = validateStoredEvidence({
      bytes,
      declaredMimeType: "application/pdf",
      declaredSize: bytes.length + 1,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "The stored file size does not match the authorized upload size.",
    );
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("accepts an authentic callback token and rejects tampering", () => {
    configureScanner();
    const token = createScannerCallbackToken({
      evidenceId: "11111111-1111-4111-8111-111111111111",
      scanJobId: "22222222-2222-4222-8222-222222222222",
    });

    expect(verifyScannerCallbackToken(token)).toMatchObject({
      evidenceId: "11111111-1111-4111-8111-111111111111",
      scanJobId: "22222222-2222-4222-8222-222222222222",
    });
    expect(verifyScannerCallbackToken(`${token}tampered`)).toBeNull();
  });

  it("rejects an expired scanner callback token", () => {
    configureScanner();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T23:00:00.000Z"));
    const token = createScannerCallbackToken({
      evidenceId: "11111111-1111-4111-8111-111111111111",
      scanJobId: "22222222-2222-4222-8222-222222222222",
    });

    vi.setSystemTime(new Date("2026-07-11T23:31:00.000Z"));
    expect(verifyScannerCallbackToken(token)).toBeNull();
  });
});
