import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("release security gates", () => {
  it("streams every tracked file through the Telegram secret scanner without self-matching detector declarations", () => {
    const scanner = source("scripts/security/scan_tracked_secrets.py");

    expect(scanner).toContain('path.open("r", encoding="utf-8", errors="ignore")');
    expect(scanner).not.toContain("MAX_FILE_BYTES");
    expect(scanner).not.toContain("TELEGRAM_ASSIGNMENT");
    expect(scanner).toContain("TELEGRAM_TOKEN.search(line)");
    expect(scanner).toContain("TELEGRAM_URL_TOKEN.search(line)");
    expect(scanner).toContain("tracked-file-read-error");
    expect(scanner).toContain("Secret values are intentionally not printed");
  });

  it("fails closed instead of using Prisma db push for production bootstrap", () => {
    const build = source("scripts/vercel-build.mjs");

    expect(build).toContain('env.AUTO_DB_PUSH === "true" || env.AUTO_DB_SEED === "true"');
    expect(build).toContain("Automatic database bootstrap is disabled for production-safe GEM builds");
    expect(build).toContain("CHECK, RLS, trigger, and grant/revoke controls");
    expect(build).not.toContain('["exec", "prisma", "db", "push"]');
  });
});
