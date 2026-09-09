const GEM_NAVY = "#001F3F";
const GEM_GOLD = "#FFBF00";
const GEM_WHITE = "#FFFFFF";
const GEM_SITE = "https://www.gemcybersecurityassist.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function splitTrailingUrlPunctuation(rawUrl: string): {
  url: string;
  trailingPunctuation: string;
} {
  let url = rawUrl;
  let trailingPunctuation = "";

  const sentencePunctuation = url.match(/[.,!?;:]+$/)?.[0] ?? "";
  if (sentencePunctuation) {
    url = url.slice(0, -sentencePunctuation.length);
    trailingPunctuation = sentencePunctuation;
  }

  const bracketPairs = [
    [")", "("],
    ["]", "["],
    ["}", "{"],
  ] as const;

  for (const [closing, opening] of bracketPairs) {
    while (url.endsWith(closing)) {
      const openingCount = url.split(opening).length - 1;
      const closingCount = url.split(closing).length - 1;
      if (closingCount <= openingCount) break;
      url = url.slice(0, -1);
      trailingPunctuation = closing + trailingPunctuation;
    }
  }

  return { url, trailingPunctuation };
}

function linkifyText(value: string): string {
  const urlPattern = /https?:\/\/[^\s<>"']+/g;
  let html = "";
  let cursor = 0;

  for (const match of value.matchAll(urlPattern)) {
    const rawUrl = match[0];
    const { url, trailingPunctuation } = splitTrailingUrlPunctuation(rawUrl);
    const index = match.index ?? 0;
    html += escapeHtml(value.slice(cursor, index));

    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        const safeUrl = escapeHtml(parsed.toString());
        html += `<a href="${safeUrl}" style="color:${GEM_NAVY};font-weight:700;text-decoration:underline;text-decoration-color:${GEM_GOLD};text-underline-offset:3px">${escapeHtml(url)}</a>${escapeHtml(trailingPunctuation)}`;
      } else {
        html += escapeHtml(rawUrl);
      }
    } catch {
      html += escapeHtml(rawUrl);
    }

    cursor = index + rawUrl.length;
  }

  return html + escapeHtml(value.slice(cursor));
}

function renderBody(body: string): string {
  const normalized = body.trim();
  if (!normalized) {
    return '<p style="margin:0;font-size:15px;line-height:1.75;color:#344054">GEM Enterprise campaign update.</p>';
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => {
      const content = paragraph
        .split("\n")
        .map((line) => linkifyText(line))
        .join("<br />");
      return `<p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#344054">${content}</p>`;
    })
    .join("");
}

function safeWebUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export interface GemCampaignEmailInput {
  subject: string;
  body: string;
  eyebrow?: string;
  postalAddress?: string;
  unsubscribeUrl?: string;
  replyTo?: string;
}

export interface GemCampaignEmail {
  html: string;
  text: string;
}

export function renderGemCampaignEmail({
  subject,
  body,
  eyebrow = "GEM Enterprise Campaign",
  postalAddress,
  unsubscribeUrl,
  replyTo,
}: GemCampaignEmailInput): GemCampaignEmail {
  const safeSubject = escapeHtml(subject.trim() || "GEM Enterprise Update");
  const safeEyebrow = escapeHtml(eyebrow);
  const preheader = escapeHtml(body.replace(/\s+/g, " ").trim().slice(0, 150));
  const bodyHtml = renderBody(body);
  const normalizedUnsubscribeUrl = safeWebUrl(unsubscribeUrl);
  const safePostalAddress = postalAddress?.trim()
    ? escapeHtml(postalAddress.trim())
    : "";
  const safeReplyTo = replyTo?.trim() ? escapeHtml(replyTo.trim()) : "";
  const safeUnsubscribeUrl = normalizedUnsubscribeUrl
    ? escapeHtml(normalizedUnsubscribeUrl)
    : "";

  const complianceHtml =
    safePostalAddress && safeUnsubscribeUrl
      ? `<div style="margin-top:12px;font-size:11px;line-height:1.7;color:#93A4B5">This is a commercial communication from GEM Enterprise.<br />Mailing address: ${safePostalAddress}<br /><a href="${safeUnsubscribeUrl}" style="color:${GEM_GOLD};text-decoration:underline">Unsubscribe from marketing email</a>${safeReplyTo ? `<br />Preference support: ${safeReplyTo}` : ""}</div>`
      : `<div style="margin-top:12px;font-size:11px;line-height:1.7;color:#93A4B5">GEM marketing compliance details are applied by the production sender at delivery time.</div>`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${safeSubject}</title>
  </head>
  <body style="margin:0;padding:0;background:#F4F6F8;font-family:Arial,Helvetica,sans-serif;color:#172033">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F4F6F8;margin:0;padding:0">
      <tr>
        <td align="center" style="padding:28px 12px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:${GEM_WHITE};border:1px solid #DFE4EA;border-radius:16px;overflow:hidden">
            <tr>
              <td style="background:${GEM_NAVY};padding:24px 28px;border-bottom:4px solid ${GEM_GOLD}">
                <div style="font-size:22px;line-height:1;font-weight:800;letter-spacing:2px;color:${GEM_GOLD}">GEM</div>
                <div style="margin-top:5px;font-size:11px;letter-spacing:3px;color:${GEM_WHITE};text-transform:uppercase">Enterprise</div>
                <div style="margin-top:18px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#DCE7F2">${safeEyebrow}</div>
                <div style="margin-top:8px;font-size:24px;line-height:1.3;font-weight:700;color:${GEM_WHITE}">${safeSubject}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px">
                ${bodyHtml}
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px">
                  <tr>
                    <td style="background:${GEM_GOLD};border-radius:8px">
                      <a href="${GEM_SITE}" style="display:inline-block;padding:13px 20px;font-size:14px;font-weight:700;color:${GEM_NAVY};text-decoration:none">Visit GEM Enterprise</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:${GEM_NAVY};padding:22px 28px">
                <div style="font-size:13px;font-weight:700;color:${GEM_WHITE}">GEM Enterprise</div>
                <div style="margin-top:5px;font-size:12px;line-height:1.6;color:#C8D3DF">Cybersecurity • Financial Security • Real Estate Protection</div>
                <div style="margin-top:12px;font-size:11px;line-height:1.6;color:#93A4B5">Controlled production communications. Availability and delivery remain subject to applicable qualification, scope, and governance requirements.</div>
                <div style="margin-top:12px;font-size:11px;line-height:1.6;color:#B7C4D1">
                  <a href="${GEM_SITE}/privacy" style="color:${GEM_GOLD};text-decoration:none">Privacy</a>
                  &nbsp;•&nbsp;
                  <a href="${GEM_SITE}/contact" style="color:${GEM_GOLD};text-decoration:none">Contact</a>
                </div>
                ${complianceHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const complianceText =
    postalAddress?.trim() && normalizedUnsubscribeUrl
      ? [
          "",
          "---",
          "This is a commercial communication from GEM Enterprise.",
          `Mailing address: ${postalAddress.trim()}`,
          `Unsubscribe from marketing email: ${normalizedUnsubscribeUrl}`,
          ...(replyTo?.trim()
            ? [`Preference support: ${replyTo.trim()}`]
            : []),
        ].join("\n")
      : "";

  return {
    html,
    text: `${body}${complianceText}`,
  };
}

export const gemCampaignBrand = {
  navy: GEM_NAVY,
  gold: GEM_GOLD,
  white: GEM_WHITE,
  site: GEM_SITE,
} as const;
