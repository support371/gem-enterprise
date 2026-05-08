export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasStringKey<K extends string>(
  value: unknown,
  key: K,
): value is Record<K, string> {
  return isRecord(value) && typeof value[key] === "string";
}

export function hasNumberKey<K extends string>(
  value: unknown,
  key: K,
): value is Record<K, number> {
  return isRecord(value) && typeof value[key] === "number";
}

export function hasArrayKey<K extends string>(
  value: unknown,
  key: K,
): value is Record<K, unknown[]> {
  return isRecord(value) && Array.isArray(value[key]);
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${String(value)}`);
}
