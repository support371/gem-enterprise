import { afterEach, describe, expect, it } from "vitest";
import { generateGemSupportReply, DEFAULT_GEM_AI_MODEL } from "@/lib/ai/gem-support-agent";
import { retrieveSupportKnowledge } from "@/lib/ai/support-knowledge";
import { createEscalationIssue } from "@/lib/atlassian/create-escalation-issue";
import type { AtlassianHandoffPayload } from "@/types/support";

const originalProviderEnabled = process.env.GEM_AI_PROVIDER_ENABLED;

afterEach(() => {
  if (originalProviderEnabled === undefined) delete process.env.GEM_AI_PROVIDER_ENABLED;
  else process.env.GEM_AI_PROVIDER_ENABLED = originalProviderEnabled;
});

describe("secure GEM support agent", () => {
  it("uses the current low-cost Gateway model by default", () => {
    expect(DEFAULT_GEM_AI_MODEL).toBe("openai/gpt-5.6-luna");
  });

  it("retrieves verified routes instead of inventing navigation", () => {
    expect(retrieveSupportKnowledge("Where can I manage my company workspace?")[0]).toMatchObject({
      title: "Organization workspace",
      href: "/app/workspace",
    });
    expect(retrieveSupportKnowledge("I need help with my password")[0]).toMatchObject({
      title: "Account security",
      href: "/app/security",
    });
  });

  it("remains useful and truthful when the model provider is unavailable", async () => {
    process.env.GEM_AI_PROVIDER_ENABLED = "false";
    const reply = await generateGemSupportReply({
      message: "Show me the GEM News video feed",
      history: [],
      userId: "user-test",
      userTier: "standard",
    });

    expect(reply).toMatchObject({
      source: "fallback",
      providerStatus: "disabled",
      model: "gem-deterministic-support-v2",
    });
    expect(reply.knowledgeLinks[0]).toMatchObject({ title: "GEM News", href: "/intel/news" });
    expect(reply.text).not.toMatch(/completed|guaranteed|live agent connected/i);
  });

  it("does not fabricate an external service-desk case when credentials are absent", async () => {
    const payload: AtlassianHandoffPayload = {
      projectKey: "GEMSUPPORT",
      issueType: "Support",
      summary: "Test handoff",
      description: "Test handoff",
      priority: "Medium",
      labels: ["test"],
      customFields: {},
      transcript: "Synthetic test transcript",
      sessionId: "session-test",
      userId: "user-test",
      userEmail: "test@example.com",
      queue: "General Member Support",
      createdAt: new Date(0).toISOString(),
    };

    const result = await createEscalationIssue(payload);
    expect(result).toMatchObject({ success: false, configured: false });
    expect(result.issueKey).toBeUndefined();
  });
});
