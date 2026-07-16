const BASE_URL = (
  process.env.TOKMETRIC_GPT_BASE_URL ||
  "https://www.gemcybersecurityassist.com"
).replace(/\/$/, "");
const BEARER = process.env.TOKMETRIC_GPT_BEARER || "";
const WORKSPACE_ID =
  process.env.TOKMETRIC_WORKSPACE_ID ||
  "ws_60488340ded94dcfab3b875ef9ae591c";

if (BEARER.length < 32) {
  throw new Error(
    "TOKMETRIC_GPT_BEARER must be supplied securely and contain at least 32 characters.",
  );
}

async function post(path, body, authenticated = true) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated) headers.Authorization = `Bearer ${BEARER}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "error",
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function requireStatus(result, expected, name) {
  if (result.status !== expected) {
    throw new Error(
      `${name} returned ${result.status}; expected ${expected}. Response: ${JSON.stringify(result.payload)}`,
    );
  }
}

const missingBearer = await post(
  "/functions/gptSystemReadiness",
  {},
  false,
);
requireStatus(missingBearer, 401, "Missing-bearer readiness");

const readiness = await post("/functions/gptSystemReadiness", {});
requireStatus(readiness, 200, "Authenticated readiness");
const readinessData = readiness.payload?.data || {};
if (
  readinessData.workspace_id !== WORKSPACE_ID ||
  readinessData.production_activation !== "BLOCKED" ||
  readinessData.controlled_write_mode !== "COMMAND_CENTER_ONLY" ||
  readinessData.livePublishingEnabled !== false
) {
  throw new Error(
    `Readiness safety contract failed: ${JSON.stringify(readinessData)}`,
  );
}

const connectors = await post("/functions/gptConnectorReadiness", {
  workspace_id: WORKSPACE_ID,
});
requireStatus(connectors, 200, "Connector readiness");

const planner = await post("/functions/tokmetric/agent-plan", {
  agent: "content_strategist",
  outputType: "campaign_brief",
  workspaceId: WORKSPACE_ID,
  brief:
    "Prepare an internal-only cybersecurity education campaign brief. Do not publish or take external action.",
});
requireStatus(planner, 200, "Controlled planner");
if (
  planner.payload?.data?.externalActionTaken !== false ||
  planner.payload?.data?.output?.requiredHumanReview !== true
) {
  throw new Error(
    `Planner safety contract failed: ${JSON.stringify(planner.payload?.data || {})}`,
  );
}

const audit = await post("/functions/gptGetAuditHistory", {
  workspace_id: WORKSPACE_ID,
  limit: 10,
});
requireStatus(audit, 200, "Audit history");

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl: BASE_URL,
      workspaceId: WORKSPACE_ID,
      readiness: {
        productionActivation: readinessData.production_activation,
        controlledWriteMode: readinessData.controlled_write_mode,
        livePublishingEnabled: readinessData.livePublishingEnabled,
      },
      connectors: connectors.payload?.data?.overall_status || "UNKNOWN",
      planner: {
        status: planner.payload?.data?.status,
        provider: planner.payload?.data?.provider,
        externalActionTaken: planner.payload?.data?.externalActionTaken,
      },
      auditReadable: Array.isArray(audit.payload?.data?.events),
    },
    null,
    2,
  ),
);