// Authenticated routes that are safe to return to after login.
// A path is safe if it exactly equals a prefix or starts with "<prefix>/".
export const SAFE_RETURN_PREFIXES = [
  "/portal",
  "/profile",
  "/support",
  "/settings",
  "/kyc",
  "/handoff",
];

export function isSafeReturnPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    SAFE_RETURN_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))
  );
}
