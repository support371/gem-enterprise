import type { AtlassianHandoffPayload } from "@/types/support";

export interface AtlassianIssueResult {
  success: boolean;
  issueKey?: string;
  issueUrl?: string;
  stub?: boolean;
  error?: string;
}

// ─── Atlassian Issue Creator ──────────────────────────────────────────────────
// In production: calls the Jira REST API with OAuth / API token.
// In dev or when credentials are absent: returns a deterministic stub.

export async function createEscalationIssue(
  payload: AtlassianHandoffPayload
): Promise<AtlassianIssueResult> {
  const jiraBaseUrl = process.env.ATLASSIAN_JIRA_BASE_URL;
  const jiraEmail = process.env.ATLASSIAN_JIRA_EMAIL;
  const jiraApiToken = process.env.ATLASSIAN_JIRA_API_TOKEN;

  // Stub mode — no credentials configured
  if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
    const stubKey = `${payload.projectKey}-STUB-${Date.now().toString(36).toUpperCase()}`;
    console.info(
      `[Atlassian] Stub mode — would create issue ${stubKey} in ${payload.projectKey}`,
      { queue: payload.queue, user: payload.userEmail }
    );
    return {
      success: true,
      issueKey: stubKey,
      issueUrl: `${jiraBaseUrl ?? "https://gem-enterprise.atlassian.net"}/browse/${stubKey}`,
      stub: true,
    };
  }

  // Production mode — real Jira API call
  try {
    const body = {
      fields: {
        project: { key: payload.projectKey },
        issuetype: { name: payload.issueType },
        summary: payload.summary,
        description: {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: payload.description }],
            },
          ],
        },
        priority: { name: payload.priority },
        labels: payload.labels,
      },
    };

    const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Atlassian] Failed to create issue:", errorText);
      return { success: false, error: `Jira API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      issueKey: data.key,
      issueUrl: `${jiraBaseUrl}/browse/${data.key}`,
      stub: false,
    };
  } catch (err) {
    console.error("[Atlassian] Exception creating issue:", err);
    return { success: false, error: "Failed to create Atlassian issue" };
  }
}
