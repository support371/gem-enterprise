import { createHash } from "node:crypto";
import type { GemVerifyAllowedMimeType } from "@/lib/kyc/evidence-vault";

export type GemStaticScanFinding = {
  code: string;
  severity: "warning" | "critical";
  message: string;
};

export type GemStaticScanResult = {
  status: "passed" | "failed" | "manual_review";
  engine: "gem-static-safety-v1";
  signature: string;
  sha256: string;
  detectedMimeType: GemVerifyAllowedMimeType;
  findings: GemStaticScanFinding[];
  details: {
    assurance: "structural_file_safety_only";
    antivirusEquivalent: false;
    checks: string[];
    dimensions?: { width: number; height: number };
    pageCountEstimate?: number;
  };
};

type ScanInput = {
  bytes: Buffer;
  mimeType: GemVerifyAllowedMimeType;
  expectedSha256: string;
  expectedFileSizeBytes: number;
};

const MAX_IMAGE_PIXELS = 50_000_000;
const MAX_IMAGE_DIMENSION = 20_000;
const MAX_PDF_PAGE_ESTIMATE = 250;

function sha256(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function critical(findings: GemStaticScanFinding[], code: string, message: string) {
  findings.push({ code, severity: "critical", message });
}

function warning(findings: GemStaticScanFinding[], code: string, message: string) {
  findings.push({ code, severity: "warning", message });
}

function trailingBytesAreWhitespace(bytes: Buffer, start: number) {
  for (let index = start; index < bytes.length; index += 1) {
    const value = bytes[index];
    if (value !== 0x00 && value !== 0x09 && value !== 0x0a && value !== 0x0c && value !== 0x0d && value !== 0x20) {
      return false;
    }
  }
  return true;
}

function scanPdf(bytes: Buffer, findings: GemStaticScanFinding[], checks: string[]) {
  checks.push("pdf_header", "pdf_eof", "pdf_active_content", "pdf_encryption", "pdf_trailing_data");
  const text = bytes.toString("latin1");
  const header = text.slice(0, 16);
  if (!/^%PDF-(1\.[0-9]|2\.0)/.test(header)) {
    critical(findings, "PDF_HEADER_INVALID", "The PDF header is missing or unsupported.");
  }

  const eofIndex = text.lastIndexOf("%%EOF");
  if (eofIndex < 0 || eofIndex < Math.max(0, text.length - 8192)) {
    critical(findings, "PDF_EOF_INVALID", "The PDF end marker is missing or outside the expected trailer area.");
  } else if (!trailingBytesAreWhitespace(bytes, eofIndex + 5)) {
    critical(findings, "PDF_TRAILING_DATA", "The PDF contains non-whitespace data after its end marker.");
  }

  const lowered = text.toLowerCase();
  const blockedTokens: Array<[string, string]> = [
    ["/javascript", "PDF_JAVASCRIPT"],
    ["/js", "PDF_JAVASCRIPT_ALIAS"],
    ["/launch", "PDF_LAUNCH_ACTION"],
    ["/embeddedfile", "PDF_EMBEDDED_FILE"],
    ["/richmedia", "PDF_RICH_MEDIA"],
    ["/submitform", "PDF_SUBMIT_FORM"],
    ["/importdata", "PDF_IMPORT_DATA"],
    ["/openaction", "PDF_OPEN_ACTION"],
  ];
  for (const [token, code] of blockedTokens) {
    if (lowered.includes(token)) {
      critical(findings, code, `The PDF contains a prohibited active-content marker (${token}).`);
    }
  }

  if (lowered.includes("/encrypt")) {
    warning(findings, "PDF_ENCRYPTED", "The PDF is encrypted and cannot be fully inspected automatically.");
  }
  if (lowered.includes("/acroform") || lowered.includes("/xfa") || lowered.includes("/aa")) {
    warning(findings, "PDF_INTERACTIVE_CONTENT", "The PDF contains interactive form or automatic-action structures.");
  }
  if (!lowered.includes("startxref")) {
    warning(findings, "PDF_XREF_UNCONFIRMED", "The PDF cross-reference trailer could not be confirmed.");
  }

  const pageCountEstimate = (text.match(/\/Type\s*\/Page\b/g) ?? []).length;
  if (pageCountEstimate > MAX_PDF_PAGE_ESTIMATE) {
    critical(findings, "PDF_PAGE_LIMIT", "The PDF exceeds the approved page-count limit.");
  }
  return { pageCountEstimate };
}

function scanPng(bytes: Buffer, findings: GemStaticScanFinding[], checks: string[]) {
  checks.push("png_chunk_structure", "png_dimensions", "png_terminal_chunk", "png_trailing_data");
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)) {
    critical(findings, "PNG_SIGNATURE_INVALID", "The PNG signature is invalid.");
    return {};
  }

  let offset = 8;
  let sawHeader = false;
  let sawEnd = false;
  let dimensions: { width: number; height: number } | undefined;
  const knownCritical = new Set(["IHDR", "PLTE", "IDAT", "IEND"]);

  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    const end = offset + 12 + length;
    if (length > 16 * 1024 * 1024 || end > bytes.length) {
      critical(findings, "PNG_CHUNK_BOUNDS", "The PNG contains a malformed or oversized chunk.");
      break;
    }
    if (!sawHeader && type !== "IHDR") {
      critical(findings, "PNG_HEADER_ORDER", "The PNG header chunk is not first.");
    }
    if (type === "IHDR") {
      if (sawHeader || length !== 13) {
        critical(findings, "PNG_HEADER_INVALID", "The PNG header chunk is duplicated or malformed.");
      } else {
        sawHeader = true;
        const width = bytes.readUInt32BE(offset + 8);
        const height = bytes.readUInt32BE(offset + 12);
        dimensions = { width, height };
        if (
          width < 1 ||
          height < 1 ||
          width > MAX_IMAGE_DIMENSION ||
          height > MAX_IMAGE_DIMENSION ||
          width * height > MAX_IMAGE_PIXELS
        ) {
          critical(findings, "PNG_DIMENSIONS_UNSAFE", "The PNG dimensions exceed the approved safety limits.");
        }
      }
    }
    const isCritical = type.length === 4 && type[0] === type[0]?.toUpperCase();
    if (isCritical && !knownCritical.has(type)) {
      critical(findings, "PNG_UNKNOWN_CRITICAL_CHUNK", `The PNG contains an unsupported critical chunk (${type}).`);
    }
    offset = end;
    if (type === "IEND") {
      sawEnd = true;
      if (!trailingBytesAreWhitespace(bytes, offset)) {
        critical(findings, "PNG_TRAILING_DATA", "The PNG contains data after its terminal chunk.");
      }
      break;
    }
  }

  if (!sawHeader) critical(findings, "PNG_HEADER_MISSING", "The PNG header chunk is missing.");
  if (!sawEnd) critical(findings, "PNG_END_MISSING", "The PNG terminal chunk is missing.");
  return { dimensions };
}

function isStartOfFrame(marker: number) {
  return [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
}

function scanJpeg(bytes: Buffer, findings: GemStaticScanFinding[], checks: string[]) {
  checks.push("jpeg_marker_structure", "jpeg_dimensions", "jpeg_terminal_marker", "jpeg_trailing_data");
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    critical(findings, "JPEG_SIGNATURE_INVALID", "The JPEG start marker is invalid.");
    return {};
  }

  let offset = 2;
  let dimensions: { width: number; height: number } | undefined;
  let endMarker = -1;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9) {
      endMarker = offset;
      break;
    }
    if (marker === 0xda) {
      for (let index = offset; index + 1 < bytes.length; index += 1) {
        if (bytes[index] === 0xff && bytes[index + 1] === 0xd9) {
          endMarker = index + 2;
          break;
        }
      }
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) {
      critical(findings, "JPEG_SEGMENT_TRUNCATED", "The JPEG contains a truncated marker segment.");
      break;
    }
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      critical(findings, "JPEG_SEGMENT_BOUNDS", "The JPEG contains a malformed marker segment.");
      break;
    }
    if (isStartOfFrame(marker) && segmentLength >= 7) {
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      dimensions = { width, height };
      if (
        width < 1 ||
        height < 1 ||
        width > MAX_IMAGE_DIMENSION ||
        height > MAX_IMAGE_DIMENSION ||
        width * height > MAX_IMAGE_PIXELS
      ) {
        critical(findings, "JPEG_DIMENSIONS_UNSAFE", "The JPEG dimensions exceed the approved safety limits.");
      }
    }
    offset += segmentLength;
  }

  if (endMarker < 0) {
    critical(findings, "JPEG_END_MISSING", "The JPEG terminal marker is missing.");
  } else if (!trailingBytesAreWhitespace(bytes, endMarker)) {
    critical(findings, "JPEG_TRAILING_DATA", "The JPEG contains data after its terminal marker.");
  }
  if (!dimensions) {
    warning(findings, "JPEG_DIMENSIONS_UNCONFIRMED", "The JPEG dimensions could not be confirmed from its frame markers.");
  }
  return { dimensions };
}

export function runGemStaticEvidenceScan(input: ScanInput): GemStaticScanResult {
  const findings: GemStaticScanFinding[] = [];
  const checks = ["sha256_integrity", "authorized_size", "approved_mime_type"];
  const actualSha256 = sha256(input.bytes);

  if (input.bytes.length !== input.expectedFileSizeBytes) {
    critical(findings, "FILE_SIZE_MISMATCH", "The file size changed after upload authorization.");
  }
  if (actualSha256.toLowerCase() !== input.expectedSha256.toLowerCase()) {
    critical(findings, "SHA256_MISMATCH", "The file checksum changed before safety scanning.");
  }

  let metadata: { dimensions?: { width: number; height: number }; pageCountEstimate?: number } = {};
  if (input.mimeType === "application/pdf") {
    metadata = scanPdf(input.bytes, findings, checks);
  } else if (input.mimeType === "image/png") {
    metadata = scanPng(input.bytes, findings, checks);
  } else {
    metadata = scanJpeg(input.bytes, findings, checks);
  }

  const hasCritical = findings.some((finding) => finding.severity === "critical");
  const hasWarning = findings.some((finding) => finding.severity === "warning");
  const status = hasCritical ? "failed" : hasWarning ? "manual_review" : "passed";
  const signature = findings[0]?.code ?? "GEM_STATIC_CHECKS_PASSED";

  return {
    status,
    engine: "gem-static-safety-v1",
    signature,
    sha256: actualSha256,
    detectedMimeType: input.mimeType,
    findings,
    details: {
      assurance: "structural_file_safety_only",
      antivirusEquivalent: false,
      checks,
      ...metadata,
    },
  };
}
