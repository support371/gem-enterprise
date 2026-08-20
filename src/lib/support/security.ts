import { NextRequest } from "next/server";

export class SupportSecurityError extends Error {
  constructor(
    message: string,
    readonly code: "SAME_ORIGIN_REQUIRED" | "SENSITIVE_INPUT_REJECTED",
    readonly statusCode = 403,
  ) {
    super(message);
    this.name = "SupportSecurityError";
  }
}

export function requireSameOriginSupportRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (!origin || (fetchSite && fetchSite !== "same-origin")) {
    throw new SupportSecurityError(
      "An explicit same-origin browser request is required.",
      "SAME_ORIGIN_REQUIRED",
    );
  }

  let requestOrigin: string;
  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    throw new SupportSecurityError(
      "An explicit same-origin browser request is required.",
      "SAME_ORIGIN_REQUIRED",
    );
  }

  if (requestOrigin !== request.nextUrl.origin) {
    throw new SupportSecurityError(
      "An explicit same-origin browser request is required.",
      "SAME_ORIGIN_REQUIRED",
    );
  }
}

const SENSITIVE_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|client[_ -]?secret|private[_ -]?key|seed phrase|recovery code|one[- ]time code|otp|password)\s*[:=]\s*\S+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/,
  /\bgh[opsu]_[A-Za-z0-9]{20,}\b/,
];

function passesLuhn(value: string) {
  let sum = 0;
  let double = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function containsSensitiveSupportInput(value: string) {
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(value))) return true;

  const possibleCards: string[] = Array.from(
    value.matchAll(/(?:\d[ -]?){13,19}/g),
    (match) => match[0],
  );
  return possibleCards.some((candidate) => {
    const digits = candidate.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits);
  });
}

export function assertSafeSupportInput(value: string) {
  if (!containsSensitiveSupportInput(value)) return;
  throw new SupportSecurityError(
    "Remove passwords, tokens, private keys, payment-card numbers, or authentication codes before sending this message.",
    "SENSITIVE_INPUT_REJECTED",
    422,
  );
}
