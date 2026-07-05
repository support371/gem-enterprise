import { TokMetricError } from "@/lib/tokmetric/security";

export type TokMetricAgentName =
  | "content_strategist"
  | "script_writer"
  | "quality_reviewer"
  | "publishing_coordinator";

export type TokMetricAgentDefinition = {
  name: TokMetricAgentName;
  description: string;
  allowedOutputs: string[];
  canPublish: false;
  requiresHumanApproval: boolean;
};

export const tokMetricAgents: Record<TokMetricAgentName, TokMetricAgentDefinition> = {
  content_strategist: {
    name: "content_strategist",
    description: "Produces campaign concepts, audience hypotheses, and draft content plans.",
    allowedOutputs: ["campaign_brief", "content_outline", "audience_notes"],
    canPublish: false,
    requiresHumanApproval: false,
  },
  script_writer: {
    name: "script_writer",
    description: "Produces draft scripts, captions, hooks, and hashtags for review.",
    allowedOutputs: ["script", "caption", "hashtags"],
    canPublish: false,
    requiresHumanApproval: false,
  },
  quality_reviewer: {
    name: "quality_reviewer",
    description: "Flags unsupported claims, missing disclosures, and content needing human review.",
    allowedOutputs: ["findings", "recommended_changes", "review_result"],
    canPublish: false,
    requiresHumanApproval: true,
  },
  publishing_coordinator: {
    name: "publishing_coordinator",
    description: "Prepares approved content for a publishing job without claiming external success.",
    allowedOutputs: ["publish_plan", "job_request", "preflight_report"],
    canPublish: false,
    requiresHumanApproval: true,
  },
};

export function getTokMetricAgent(name: string) {
  if (!(name in tokMetricAgents)) {
    throw new TokMetricError(404, "AGENT_NOT_FOUND", "TokMetric agent was not found.");
  }
  return tokMetricAgents[name as TokMetricAgentName];
}

export function validateAgentOutput(name: TokMetricAgentName, outputType: string) {
  const agent = tokMetricAgents[name];
  if (!agent.allowedOutputs.includes(outputType)) {
    throw new TokMetricError(400, "AGENT_OUTPUT_NOT_ALLOWED", "The requested output type is not allowed for this agent.");
  }
  return agent;
}
