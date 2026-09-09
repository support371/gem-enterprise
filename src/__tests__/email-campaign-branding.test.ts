import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gemCampaignBrand,
  renderGemCampaignEmail,
} from "@/lib/email/gemCampaignTemplate";

describe("GEM campaign email branding", () => {
  it("renders the approved GEM Enterprise navy, gold, and white identity", () => {
    const rendered = renderGemCampaignEmail({
      subject: "Founding Business Review",
      body: "A controlled GEM Enterprise campaign update.",
    });

    expect(rendered.html).toContain(gemCampaignBrand.navy);
    expect(rendered.html).toContain(gemCampaignBrand.gold);
    expect(rendered.html).toContain(gemCampaignBrand.white);
    expect(rendered.html).toContain("GEM Enterprise");
    expect(rendered.html).toContain("Founding Business Review");
    expect(rendered.html).toContain("Visit GEM Enterprise");
    expect(rendered.text).toBe("A controlled GEM Enterprise campaign update.");
  });

  it("escapes untrusted campaign markup while preserving safe web links", () => {
    const rendered = renderGemCampaignEmail({
      subject: '<script>alert("subject")</script>',
      body: 'Review <script>alert("body")</script> at https://www.gemcybersecurityassist.com/business-review',
    });

    expect(rendered.html).not.toContain('<script>alert("subject")</script>');
    expect(rendered.html).not.toContain('<script>alert("body")</script>');
    expect(rendered.html).toContain("&lt;script&gt;alert(&quot;subject&quot;)&lt;/script&gt;");
    expect(rendered.html).toContain("https://www.gemcybersecurityassist.com/business-review");
  });

  it("keeps sentence punctuation outside branded link targets", () => {
    const rendered = renderGemCampaignEmail({
      subject: "Review link",
      body: "Read https://www.gemcybersecurityassist.com/business-review. Then compare (https://www.gemcybersecurityassist.com/services).",
    });

    expect(rendered.html).toContain('href="https://www.gemcybersecurityassist.com/business-review"');
    expect(rendered.html).not.toContain('href="https://www.gemcybersecurityassist.com/business-review."');
    expect(rendered.html).toContain('href="https://www.gemcybersecurityassist.com/services"');
    expect(rendered.html).not.toContain('href="https://www.gemcybersecurityassist.com/services)"');
    expect(rendered.html).toContain("</a>.");
    expect(rendered.html).toContain("</a>).");
  });

  it("requires campaign delivery to include branded HTML and text fallback", () => {
    const sendRoute = readFileSync(
      "src/app/api/admin/campaigns/[id]/send/route.ts",
      "utf8",
    );

    expect(sendRoute).toContain("renderGemCampaignEmail");
    expect(sendRoute).toContain("text: renderedCampaign.text");
    expect(sendRoute).toContain("html: renderedCampaign.html");
    expect(sendRoute).toContain('emailTemplate: "gem-enterprise-branded-v1"');
    expect(sendRoute).not.toContain("text: campaign.body,");
  });

  it("shows the production-equivalent branded renderer in the admin composer", () => {
    const composer = readFileSync(
      "src/app/app/admin/campaigns/new/page.tsx",
      "utf8",
    );

    expect(composer).toContain("renderGemCampaignEmail");
    expect(composer).toContain("GEM Enterprise branded delivery enforced");
    expect(composer).toContain("Production renderer");
    expect(composer).toContain("srcDoc={previewEmail.html}");
    expect(composer).toContain('sandbox=""');
  });
});
