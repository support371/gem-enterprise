const DEFAULT_APP_URL = "https://www.gemcybersecurityassist.com";

const routes = [
  "/",
  "/services",
  "/intel",
  "/resources",
  "/company",
  "/about",
  "/contact",
  "/get-started",
  "/eligibility/status",
  "/privacy",
  "/terms",
  "/compliance-notice",
  "/cookie-policy",
  "/trust-center",
];

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  const urls = routes.map((route) => `<url><loc>${baseUrl}${route}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, { headers: { "content-type": "application/xml" } });
}
