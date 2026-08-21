import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function request(hostname: string, pathname = "/") {
  return new NextRequest(`https://${hostname}${pathname}`, {
    headers: { host: hostname },
  });
}

describe("management surface proxy", () => {
  it.each([
    ["auth.gemcybersecurityassist.com", "/login"],
    ["portal.gemcybersecurityassist.com", "/client-login"],
    ["team.gemcybersecurityassist.com", "/team-login"],
    ["admin.gemcybersecurityassist.com", "/admin-login"],
    ["control.gemcybersecurityassist.com", "/super-admin-login"],
  ])("maps %s to its isolated entry point", async (host, expectedPath) => {
    const response = await proxy(request(host));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `https://${host}${expectedPath}`,
    );
  });

  it("does not rewrite the public website root into a management application", async () => {
    const response = await proxy(request("www.gemcybersecurityassist.com"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects a mismatched direct login path to the host-owned login", async () => {
    const response = await proxy(
      request("control.gemcybersecurityassist.com", "/client-login"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://control.gemcybersecurityassist.com/super-admin-login",
    );
  });

  it("keeps signed-out admin and owner routes on their own applications", async () => {
    const admin = await proxy(
      request("admin.gemcybersecurityassist.com", "/app/admin"),
    );
    const control = await proxy(
      request(
        "control.gemcybersecurityassist.com",
        "/app/admin/workspace-access",
      ),
    );

    expect(admin.headers.get("location")).toBe(
      "https://admin.gemcybersecurityassist.com/admin-login?next=%2Fapp%2Fadmin",
    );
    expect(control.headers.get("location")).toBe(
      "https://control.gemcybersecurityassist.com/super-admin-login?next=%2Fapp%2Fadmin%2Fworkspace-access",
    );
  });

  it("does not expose an admin sign-in when an admin path is tried on the client host", async () => {
    const response = await proxy(
      request("portal.gemcybersecurityassist.com", "/app/admin/users"),
    );
    expect(response.headers.get("location")).toBe(
      "https://portal.gemcybersecurityassist.com/client-login?next=%2Fapp%2Fadmin%2Fusers",
    );
  });
});
