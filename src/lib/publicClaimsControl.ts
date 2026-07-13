import type { PublicClaim } from "@/lib/publicClaims";

export interface ControlledClaimPattern {
  key: string;
  description: string;
  pattern: RegExp;
}

export interface ClaimPatternMatch {
  key: string;
  description: string;
  match: string;
  index: number;
}

export const controlledClaimPatterns: readonly ControlledClaimPattern[] = [
  {
    key: "round-the-clock",
    description: "Round-the-clock or 24/7 availability",
    pattern: /\b24\s*\/\s*7\b/gi,
  },
  {
    key: "fixed-response-time",
    description: "Fixed response, acknowledgement, or decision time",
    pattern: /(?:within|under|less than|<)\s*\d+\s*(?:minutes?|hours?|business days?)/gi,
  },
  {
    key: "live-or-active",
    description: "Unqualified live or active production status",
    pattern: /\b(?:live|active)\b/gi,
  },
  {
    key: "automatic-execution",
    description: "Automatic execution or activation",
    pattern: /\b(?:automatically executed|executed automatically|automatic activation)\b/gi,
  },
  {
    key: "certified-or-verified",
    description: "Certification or verification claim",
    pattern: /\b(?:certified|verified)\b/gi,
  },
  {
    key: "encryption",
    description: "Encryption or encrypted-service claim",
    pattern: /\b(?:encrypted|encryption)\b/gi,
  },
  {
    key: "guarantee",
    description: "Guarantee or unconditional promise",
    pattern: /\b(?:guarantee|guaranteed|always|never)\b/gi,
  },
  {
    key: "relationship",
    description: "Partnership, membership, affiliation, or consortium claim",
    pattern: /\b(?:partnership|partner|membership|affiliation|consortium)\b/gi,
  },
  {
    key: "staff-count",
    description: "Specific public staffing count",
    pattern: /\b\d+\+\s+(?:analysts|advisors|attorneys|officers|professionals|specialists)\b/gi,
  },
  {
    key: "real-time",
    description: "Real-time capability claim",
    pattern: /\breal[- ]time\b/gi,
  },
];

export function scanTextForControlledClaims(text: string): ClaimPatternMatch[] {
  const matches: ClaimPatternMatch[] = [];

  for (const rule of controlledClaimPatterns) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    let result: RegExpExecArray | null;

    while ((result = pattern.exec(text)) !== null) {
      matches.push({
        key: rule.key,
        description: rule.description,
        match: result[0],
        index: result.index,
      });

      if (result[0].length === 0) {
        pattern.lastIndex += 1;
      }
    }
  }

  return matches.sort((left, right) => left.index - right.index);
}

export function validatePublicClaims(claims: readonly PublicClaim[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const claim of claims) {
    if (ids.has(claim.id)) {
      errors.push(`Duplicate claim ID: ${claim.id}`);
    }
    ids.add(claim.id);

    if (!claim.id.trim()) errors.push("A claim is missing an ID");
    if (!claim.route.startsWith("/")) errors.push(`${claim.id}: route must start with /`);
    if (!claim.sourcePath.trim()) errors.push(`${claim.id}: sourcePath is required`);
    if (!claim.currentWording.trim()) errors.push(`${claim.id}: currentWording is required`);
    if (!claim.approvedWording.trim()) errors.push(`${claim.id}: approvedWording is required`);
    if (claim.evidenceRequired.length === 0) errors.push(`${claim.id}: evidenceRequired is empty`);
    if (!claim.owner.trim()) errors.push(`${claim.id}: owner is required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(claim.reviewBy)) {
      errors.push(`${claim.id}: reviewBy must use YYYY-MM-DD`);
    }

    if (
      (claim.evidenceStatus === "unverified" ||
        claim.evidenceStatus === "blocked" ||
        claim.evidenceStatus === "expired" ||
        claim.evidenceStatus === "rejected") &&
      claim.publicationAction === "allow"
    ) {
      errors.push(`${claim.id}: unresolved evidence cannot have publicationAction=allow`);
    }

    if (
      claim.publicationAction !== "allow" &&
      claim.approvedWording.trim().toLowerCase() === claim.currentWording.trim().toLowerCase()
    ) {
      errors.push(`${claim.id}: controlled claims require different approved wording`);
    }
  }

  return errors;
}
