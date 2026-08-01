import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ManusCampaignBriefSchema,
  ManusCampaignOutputSchema,
  buildManusCampaignPrompt,
  manusCampaignStructuredOutputSchema,
} from "@/lib/manus/campaign";
import { assertManusTaskCreationApproved } from "@/lib/manus/client";

const originalCreationEnabled = process.env.MANUS_TASK_CREATION_ENABLED;
const originalBillingApproved = process.env.MANUS_BILLING_APPROVED;

afterEach(() => {
  if (originalCreationEnabled === undefined) {
    delete process.env.MANUS_TASK_CREATION_ENABLED;
  } else {
    process.env.MANUS_TASK_CREATION_ENABLED = originalCreationEnabled;
  }
  if (originalBillingApproved === undefined) {
    delete process.env.MANUS_BILLING_APPROVED;
  } else {
    process.env.MANUS_BILLING_APPROVED = originalBillingApproved;
  }
});

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Manus governed campaign agent", () => {
  const createRoute = source("src/app/api/admin/manus/campaigns/route.ts");
  const taskRoute = source("src/app/api/admin/manus/tasks/[taskId]/route.ts");
  const client = source("src/lib/manus/client.ts");

  it("validates a bounded campaign brief", () => {
    const parsed = ManusCampaignBriefSchema.safeParse({
      objective: "Generate qualified consultation requests for a security review.",
      service: "Business Monitor",
      audience: "Small property-management firms",
      location: "United States",
      channels: ["EMAIL", "LINKEDIN"],
      callToAction: "Request a consultation",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires the complete structured campaign contract", () => {
    expect(manusCampaignStructuredOutputSchema.additionalProperties).toBe(false);
    expect(manusCampaignStructuredOutputSchema.required).toContain("emailBody");
    expect(manusCampaignStructuredOutputSchema.required).toContain("complianceFindings");
    expect(
      ManusCampaignOutputSchema.safeParse({ campaignTitle: "Incomplete" }).success,
    ).toBe(false);
  });

  it("instructs Manus to remain draft-only and permission-based", () => {
    const prompt = buildManusCampaignPrompt({
      objective: "Create a controlled campaign for qualified enquiries.",
      service: "Managed cybersecurity services",
      audience: "Small businesses",
      channels: ["EMAIL"],
      callToAction: "Request access",
    });
    expect(prompt).toContain("Produce drafts only");
    expect(prompt).toContain("Do not send email");
    expect(prompt).toContain("permission-based marketing");
    expect(prompt).toContain("Do not invent licences");
    expect(prompt).toContain("separate compliance review and human approval");
  });

  it("keeps the API key server-side and tasks private", () => {
    expect(client).toContain("process.env.MANUS_API_KEY");
    expect(client).toContain("process.env.MANUS_TASK_CREATION_ENABLED");
    expect(client).toContain("process.env.MANUS_BILLING_APPROVED");
    expect(client).toContain("assertManusTaskCreationApproved()");
    expect(client).toContain('"x-manus-api-key": config.apiKey');
    expect(client).toContain('share_visibility: "private"');
    expect(client).toContain('interactive_mode: false');
    expect(client).not.toContain("NEXT_PUBLIC_MANUS_API_KEY");
  });

  it("fails closed unless task creation and billing are both explicitly approved", () => {
    delete process.env.MANUS_TASK_CREATION_ENABLED;
    delete process.env.MANUS_BILLING_APPROVED;
    expect(() => assertManusTaskCreationApproved()).toThrow("task creation is disabled");

    process.env.MANUS_TASK_CREATION_ENABLED = "true";
    expect(() => assertManusTaskCreationApproved()).toThrow("task creation is disabled");

    process.env.MANUS_TASK_CREATION_ENABLED = "false";
    process.env.MANUS_BILLING_APPROVED = "true";
    expect(() => assertManusTaskCreationApproved()).toThrow("task creation is disabled");

    process.env.MANUS_TASK_CREATION_ENABLED = "true";
    expect(() => assertManusTaskCreationApproved()).not.toThrow();
  });

  it("requires admin access and same-origin creation", () => {
    expect(createRoute).toContain("requireAdmin()");
    expect(createRoute).toContain("requireSameOrigin(request)");
    expect(createRoute).toContain("manus_campaign_task_reservation");
    expect(createRoute).toContain("pg_advisory_xact_lock");
    expect(createRoute).toContain("externalActionTaken: true");
    expect(createRoute).toContain("publicationAllowed: false");
    expect(taskRoute).toContain("requireAdmin()");
    expect(taskRoute).toContain("userId: gate.session.userId");
    expect(taskRoute).toContain('resource: "manus_campaign_task_reservation"');
    expect(taskRoute).toContain("externalActionTaken: false");
  });
});
