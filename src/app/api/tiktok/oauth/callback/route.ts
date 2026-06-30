import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CALLBACK_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "Content-Type": "text/html; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

function renderPage(title: string, message: string, status: number) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${title} | GEM Enterprise</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: #07111f;
        color: #e8eef7;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(640px, 100%);
        padding: 32px;
        border: 1px solid #22324a;
        border-radius: 18px;
        background: #0d1a2b;
        box-shadow: 0 20px 60px rgba(0,0,0,.35);
      }
      .eyebrow {
        margin: 0 0 12px;
        color: #70b7ff;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      h1 { margin: 0 0 14px; font-size: clamp(28px, 5vw, 40px); line-height: 1.1; }
      p { margin: 0; color: #b7c5d8; font-size: 16px; line-height: 1.65; }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 24px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #132844;
        color: #cfe7ff;
        font-size: 13px;
        font-weight: 700;
      }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #3ddc97; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">GEM Enterprise · TikTok Business</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="status"><span class="dot" aria-hidden="true"></span> Secure callback endpoint</div>
    </main>
  </body>
</html>`;

  return new Response(html, { status, headers: CALLBACK_HEADERS });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const error = params.get("error") ?? params.get("error_code");
  const authorizationCode = params.get("auth_code") ?? params.get("code");

  if (error) {
    return renderPage(
      "TikTok authorization was not completed",
      "TikTok returned an authorization error. No account data was stored. You may close this page and restart the connection from the authorized business dashboard.",
      400,
    );
  }

  if (authorizationCode) {
    return renderPage(
      "TikTok authorization received",
      "The authorization response reached GEM Enterprise successfully. The authorization code is not displayed or cached by this page. Final token exchange will run server-side after the TikTok app credentials are configured.",
      200,
    );
  }

  return renderPage(
    "TikTok Business callback is active",
    "This public HTTPS endpoint is online and ready to receive TikTok Business OAuth redirects for the GEM marketing integration.",
    200,
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": CALLBACK_HEADERS["Cache-Control"],
      "Content-Security-Policy": CALLBACK_HEADERS["Content-Security-Policy"],
      "Referrer-Policy": CALLBACK_HEADERS["Referrer-Policy"],
      "X-Content-Type-Options": CALLBACK_HEADERS["X-Content-Type-Options"],
      "X-Frame-Options": CALLBACK_HEADERS["X-Frame-Options"],
    },
  });
}
