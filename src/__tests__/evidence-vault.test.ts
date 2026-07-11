import { describe, expect, it } from "vitest";
import {
  GEM_VERIFY_MAX_FILE_BYTES,
  validateEvidenceUploadMetadata,
} from "@/lib/kyc/evidence-vault";

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
});
