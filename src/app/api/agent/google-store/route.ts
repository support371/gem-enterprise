import { getAgentStoreSummary, jsonNoStore, requireGemAgent } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireGemAgent(request);
  if (denied) return denied;

  return jsonNoStore({
    ok: true,
    store: getAgentStoreSummary().google,
  });
}
