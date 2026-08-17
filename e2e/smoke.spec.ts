import { expect, test } from "@playwright/test";

test.describe("GEM Enterprise smoke", () => {
  test("@smoke public home responds without a server failure", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });

    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
