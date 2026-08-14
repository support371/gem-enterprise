import type { AtlassianHandoffPayload } from "@/types/support";

export interface AtlassianIssueResult {
  success: boolean;
  configured: boolean;
  issueKey?: string;
  issueUrl?: string;
  error?: string;
}

// ─── Atlassian Issue Creator ──────────────────────────────────────────────────
// In production: calls the Jira REST API with OAuth / API token.
// Missing credentials fail closed so callers can create a durable GEM ticket.

export async function createEscalationIssue(
  payload: AtlassianHandoffPayload
): Promise<AtlassianIssueResult> {
  const jiraBaseUrl = process.env.ATLASSIAN_JIRA_BASE_URL;
  const jiraEmail = process.env.ATLASSIAN_JIRA_EMAIL;
  const jiraApiToken = process.env.ATLASSIAN_JIRA_API_TOKEN;

  if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
    return {
      success: false,
      configured: false,
      error: "Atlassian handoff is not configured",
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
      console.error("[Atlassian] Failed to create issue with status", response.status);
      return { success: false, configured: true, error: `Jira API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      configured: true,
      issueKey: data.key,
      issueUrl: `${jiraBaseUrl}/browse/${data.key}`,
    };
  } catch (err) {
    console.error("[Atlassian] Exception creating issue:", err);
    return { success: false, configured: true, error: "Failed to create Atlassian issue" };
  }
}
