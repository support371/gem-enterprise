import { TokMetricError } from "@/lib/tokmetric/security";
import { getTikTokOAuthConfig } from "@/lib/tokmetric/oauth/config";

export function getTokMetricPublishingGate() {
  const environment = getTikTokOAuthConfig().environment;
  const productionEnabled = process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true";
  const sandboxEnabled = process.env.TOKMETRIC_SANDBOX_PUBLISHING_ENABLED === "true";
  const enabled = productionEnabled || (environment === "sandbox" && sandboxEnabled);

  return {
    environment,
    productionEnabled,
    sandboxEnabled,
    enabled,
    mode: productionEnabled ? "production" : environment === "sandbox" && sandboxEnabled ? "sandbox" : "disabled",
  } as const;
}

export function enforceTokMetricPublishingGate() {
  const gate = getTokMetricPublishingGate();
  if (!gate.enabled) {
    throw new TokMetricError(
      423,
      "TIKTOK_PUBLISHING_DISABLED",
      "TikTok publishing is disabled. Enable the explicit production or sandbox publishing gate first.",
    );
  }
  return gate;
}
