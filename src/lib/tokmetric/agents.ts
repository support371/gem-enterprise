import { TokMetricError } from "@/lib/tokmetric/security";

export type TokMetricAgentName =
  | "content_strategist"
  | "script_writer"
  | "quality_reviewer"
  | "publishing_coordinator";

export type TokMetricAgentRisk = "low" | "medium" | "high";

export type TokMetricAgentDefinition = {
  name: TokMetricAgentName;
  description: string;
  allowedOutputs: readonly string[];
  canPublish: false;
  requiresHumanApproval: boolean;
  promptVersion: string;
  modelVersion: string;
  risk: TokMetricAgentRisk;
};

export const tokMetricAgents: Record<TokMetricAgentName, TokMetricAgentDefinition> = {
  content_strategist: {
    name: "content_strategist",
    description: "Produces campaign concepts, audience hypotheses, and draft content plans.",
    allowedOutputs: ["campaign_brief", "content_outline", "audience_notes"],
    canPublish: false,
    requiresHumanApproval: false,
    promptVersion: "content-strategist-v1",
    modelVersion: "tokmetric-controlled-rules-v1",
    risk: "low",
  },
  script_writer: {
    name: "script_writer",
    description: "Produces draft scripts, captions, hooks, and hashtags for review.",
    allowedOutputs: ["script", "caption", "hashtags"],
    canPublish: false,
    requiresHumanApproval: false,
    promptVersion: "script-writer-v1",
    modelVersion: "tokmetric-controlled-rules-v1",
    risk: "medium",
  },
  quality_reviewer: {
    name: "quality_reviewer",
    description: "Flags unsupported claims, missing disclosures, and content needing human review.",
    allowedOutputs: ["findings", "recommended_changes", "review_result"],
    canPublish: false,
    requiresHumanApproval: true,
    promptVersion: "quality-reviewer-v1",
    modelVersion: "tokmetric-controlled-rules-v1",
    risk: "medium",
  },
  publishing_coordinator: {
    name: "publishing_coordinator",
    description: "Prepares approved content for a publishing job without claiming external success.",
    allowedOutputs: ["publish_plan", "job_request", "preflight_report"],
    canPublish: false,
    requiresHumanApproval: true,
    promptVersion: "publishing-coordinator-v1",
    modelVersion: "tokmetric-controlled-rules-v1",
    risk: "high",
  },
};

export function isTokMetricAgentName(name: string): name is TokMetricAgentName {
  return name in tokMetricAgents;
}

export function getTokMetricAgent(name: string) {
  if (!isTokMetricAgentName(name)) {
    throw new TokMetricError(404, "AGENT_NOT_FOUND", "TokMetric agent was not found.");
  }
  return tokMetricAgents[name];
}

export function validateAgentOutput(name: TokMetricAgentName, outputType: string) {
  const agent = tokMetricAgents[name];
  if (!agent.allowedOutputs.includes(outputType)) {
    throw new TokMetricError(400, "AGENT_OUTPUT_NOT_ALLOWED", "The requested output type is not allowed for this agent.");
  }
  return agent;
}
