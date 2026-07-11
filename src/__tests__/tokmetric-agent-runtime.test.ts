import { describe, expect, it } from "vitest";
import { getTokMetricAgent } from "@/lib/tokmetric/agents";
import {
  evaluateTokMetricAgentSafety,
  generateControlledAgentOutput,
} from "@/lib/tokmetric/agentRuntime";

describe("TokMetric specialized agent runtime", () => {
  it("keeps every specialized agent unable to publish", () => {
    for (const name of ["content_strategist", "script_writer", "quality_reviewer", "publishing_coordinator"] as const) {
      expect(getTokMetricAgent(name).canPublish).toBe(false);
    }
  });

  it("blocks credential-like material and removes it from the sanitized brief", () => {
    const evaluation = evaluateTokMetricAgentSafety("Use access_token=very-secret-token and publish now");
    expect(evaluation.state).toBe("BLOCKED");
    expect(evaluation.sanitizedBrief).not.toContain("very-secret-token");
    expect(evaluation.findings.map((finding) => finding.code)).toEqual(expect.arrayContaining([
      "SECRET_MATERIAL_REDACTED",
      "UNAUTHORIZED_EXTERNAL_ACTION_REQUEST",
    ]));
  });

  it("requires human review for unsupported absolute claims", () => {
    const evaluation = evaluateTokMetricAgentSafety("Write a post claiming the service is 100% secure.");
    expect(evaluation.state).toBe("HUMAN_REVIEW_REQUIRED");
    expect(evaluation.findings[0]?.code).toBe("UNSUPPORTED_ABSOLUTE_CLAIM");
  });

  it("creates a draft script without an external action", () => {
    const safety = evaluateTokMetricAgentSafety("Explain a compliance-first TikTok content workflow.");
    const output = generateControlledAgentOutput({
      agent: "script_writer",
      outputType: "script",
      brief: safety.sanitizedBrief,
      safety,
    });
    expect(output.status).toBe("DRAFT");
    expect(output).not.toHaveProperty("published");
    expect(output).not.toHaveProperty("external_success");
  });

  it("keeps publishing-coordinator output explicitly unsubmitted", () => {
    const safety = evaluateTokMetricAgentSafety("Prepare a preflight review for an approved content draft.");
    const output = generateControlledAgentOutput({
      agent: "publishing_coordinator",
      outputType: "publish_plan",
      brief: safety.sanitizedBrief,
      safety,
    });
    expect(output.planned_state).toBe("NOT_SUBMITTED");
    expect(output.external_action_taken).toBe(false);
  });
});
