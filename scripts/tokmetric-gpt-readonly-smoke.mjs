import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.TOKMETRIC_BASE_URL || "https://gemcybersecurityassist.com").replace(/\/$/, "");
const token = process.env.TOKMETRIC_GPT_AUTH_TOKEN?.trim();
const workspaceId = process.env.TOKMETRIC_TEST_WORKSPACE_ID?.trim();
const reportPath = process.env.TOKMETRIC_REPORT_PATH || "tokmetric-gpt-smoke-report.json";

if (!token) {
  console.error("TOKMETRIC_GPT_AUTH_TOKEN is required.");
  process.exit(2);
}

if (!workspaceId) {
  console.error("TOKMETRIC_TEST_WORKSPACE_ID is required.");
  process.exit(2);
}

const results = [];

function safeBody(body) {
  if (!body || typeof body !== "object") return body;
  const copy = structuredClone(body);
  for (const key of ["access_token", "refresh_token", "client_secret", "token", "authorization"]) {
    if (key in copy) copy[key] = "[REDACTED]";
  }
  return copy;
}

function record(name, passed, details = {}) {
  const entry = { name, passed, ...details };
  results.push(entry);
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${details.status ? ` (${details.status})` : ""}`);
}

async function postAction(action, body = {}, authToken = token) {
  const headers = { "content-type": "application/json" };
  if (authToken) headers.authorization = `Bearer ${authToken}`;

  const startedAt = Date.now();
  let response;
  try {
    response = await fetch(`${baseUrl}/functions/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "manual",
    });
  } catch (error) {
    return {
      action,
      status: 0,
      duration_ms: Date.now() - startedAt,
      body: { error: error instanceof Error ? error.message : String(error) },
    };
  }

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text.slice(0, 1000) };
  }

  return {
    action,
    status: response.status,
    duration_ms: Date.now() - startedAt,
    body: safeBody(parsed),
  };
}

async function main() {
  const unauthorized = await postAction("gptSystemReadiness", {}, "");
  record(
    "rejects requests without bearer authentication",
    unauthorized.status === 401,
    unauthorized,
  );

  const unsupported = await postAction("definitelyNotATokMetricAction", {});
  record(
    "rejects unsupported actions",
    unsupported.status === 404,
    unsupported,
  );

  const readiness = await postAction("gptSystemReadiness", {});
  const readinessData = readiness.body?.data;
  const readinessPassed =
    readiness.status === 200 &&
    readiness.body?.ok === true &&
    readinessData?.gpt_auth_configured === true &&
    readinessData?.gpt_actor_configured === true &&
    readinessData?.production_activation === "BLOCKED" &&
    readinessData?.controlled_write_mode === "COMMAND_CENTER_ONLY" &&
    readinessData?.workspace_id === workspaceId;
  record("authenticated system readiness", readinessPassed, readiness);

  const workspaceActions = [
    ["gptConnectorReadiness", { workspace_id: workspaceId }],
    ["gptListAccounts", { workspace_id: workspaceId, limit: 10 }],
    ["gptListCampaigns", { workspace_id: workspaceId, limit: 10 }],
    ["gptListContent", { workspace_id: workspaceId, limit: 10 }],
    ["gptGetAnalyticsSummary", { workspace_id: workspaceId, limit: 10 }],
    ["gptGetAuditHistory", { workspace_id: workspaceId, limit: 10 }],
  ];

  for (const [action, body] of workspaceActions) {
    const result = await postAction(action, body);
    record(`${action} read-only flow`, result.status === 200 && result.body?.ok === true, result);
  }

  const blockedWrite = await postAction("gptCreateContentDraft", {
    workspace_id: workspaceId,
    title: "Controlled smoke test",
    content_type: "video",
    platform: "tiktok_organic",
  });
  record(
    "blocks GPT write operations during controlled launch",
    blockedWrite.status === 423 &&
      blockedWrite.body?.error?.code === "CONTROLLED_WRITE_DISABLED",
    blockedWrite,
  );

  const report = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    workspace_id: workspaceId,
    mode: "read_only_controlled_launch",
    live_publishing_expected: "BLOCKED",
    passed: results.every((result) => result.passed),
    results,
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (!report.passed) {
    console.error(`TokMetric Custom GPT read-only smoke test failed. Report: ${reportPath}`);
    process.exit(1);
  }

  console.log(`TokMetric Custom GPT read-only smoke test passed. Report: ${reportPath}`);
}

await main();
