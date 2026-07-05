const DEFAULT_APP_URL = "https://www.gemcybersecurityassist.com";

const disallowedRoutes = [
  "/app/",
  "/admin/",
  "/account/",
  "/billing/",
  "/documents/",
  "/messages/",
  "/requests/",
  "/community-hub/members",
  "/community-hub/messages",
  "/community-hub/requests",
  "/community-hub/profile",
  "/community-hub/settings",
  "/community-hub/opportunities",
];

export function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, "");
  const body = [
    "User-agent: *",
    "Allow: /",
    ...disallowedRoutes.map((route) => `Disallow: ${route}`),
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
