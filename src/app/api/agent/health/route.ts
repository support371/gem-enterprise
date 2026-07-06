import { getAgentPlatformContext, jsonNoStore, requireGemAgent } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireGemAgent(request);
  if (denied) return denied;

  const context = await getAgentPlatformContext();
  return jsonNoStore({
    ok: true,
    status: context.status,
    timestamp: context.timestamp,
    platform: context.platform,
    database: context.database,
  });
}
