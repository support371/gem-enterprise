export const ENTITY_TYPES = [
  "individual",
  "business",
  "trust",
  "family_office",
  "family-office",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export function isEntityType(value: unknown): value is EntityType {
  return typeof value === "string" && ENTITY_TYPES.includes(value as EntityType);
}

export function normalizeEntityType(value: unknown): EntityType {
  return isEntityType(value) ? value : "individual";
}

export function formatEntityType(value: unknown) {
  return normalizeEntityType(value).replace(/_/g, " ").replace(/-/g, " ");
}
