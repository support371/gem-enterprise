export const eligibilityTracks = [
  "individual",
  "company",
  "trust",
  "family_office",
] as const;

export type EligibilityTrack = (typeof eligibilityTracks)[number];

const eligibilityTrackSet = new Set<string>(eligibilityTracks);

export function normalizeEligibilityTrack(value: unknown): EligibilityTrack | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && eligibilityTrackSet.has(candidate)
    ? (candidate as EligibilityTrack)
    : null;
}

export function eligibilityApplicationHref(track: EligibilityTrack): string {
  return `/enterprise/apply?track=${encodeURIComponent(track)}`;
}
