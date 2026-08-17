import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const localBaseUrl = `http://127.0.0.1:${port}`;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next dev -H 127.0.0.1 -p ${port}`,
        url: localBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          JWT_SECRET: "playwright-test-secret-min-32-characters-long",
          POSTGRES_PRISMA_URL: "postgresql://e2e:e2e@localhost:5432/gem_e2e",
          POSTGRES_URL_NON_POOLING: "postgresql://e2e:e2e@localhost:5432/gem_e2e",
          NEXT_PUBLIC_APP_URL: localBaseUrl,
          NEXT_PUBLIC_APP_NAME: "GEM Enterprise",
          NEXT_PUBLIC_AI_DISCLOSURE_TEXT:
            "GEM Concierge is an AI assistant. Responses are informational and require human review for sensitive decisions.",
          AUDIT_ENABLED: "true",
          SMTP_HOST: "",
          SMTP_PORT: "587",
          SMTP_USER: "",
          SMTP_PASS: "",
          CRON_SECRET: "playwright-cron-secret",
        },
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
