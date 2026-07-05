import { TokMetricError } from "@/lib/tokmetric/security";
import { getTikTokOAuthConfig } from "@/lib/tokmetric/oauth/config";

export function getTokMetricPublishingGate() {
  const environment = getTikTokOAuthConfig().environment;
  const productionRequested = process.env.TOKMETRIC_LIVE_PUBLISHING_ENABLED === "true";
  const sandboxRequested = process.env.TOKMETRIC_SANDBOX_PUBLISHING_ENABLED === "true";
  const productionEnabled = environment === "production" && productionRequested;
  const sandboxEnabled = environment === "sandbox" && sandboxRequested;
  const enabled = productionEnabled || sandboxEnabled;

  return {
    environment,
    productionEnabled,
    sandboxEnabled,
    enabled,
    mode: productionEnabled ? "production" : sandboxEnabled ? "sandbox" : "disabled",
    configurationMismatch:
      (environment === "sandbox" && productionRequested) ||
      (environment === "production" && sandboxRequested),
  } as const;
}

export function enforceTokMetricPublishingGate() {
  const gate = getTokMetricPublishingGate();
  if (!gate.enabled) {
    throw new TokMetricError(
      423,
      "TIKTOK_PUBLISHING_DISABLED",
      gate.configurationMismatch
        ? "The publishing flag does not match the active TikTok environment."
        : "TikTok publishing is disabled. Enable the explicit production or sandbox publishing gate first.",
    );
  }
  return gate;
}
