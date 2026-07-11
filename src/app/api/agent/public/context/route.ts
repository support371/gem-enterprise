import { getAgentPlatformContext, jsonNoStore } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const context = await getAgentPlatformContext();

  return jsonNoStore({
    ok: true,
    status: context.status,
    timestamp: context.timestamp,
    platform: {
      name: context.platform.name,
      website: context.platform.website,
      agent_api: context.platform.agent_api,
      environment: context.platform.environment,
    },
    database: {
      status: context.database.status,
      configured: context.database.configured,
      diagnostic: context.database.diagnostic,
    },
    stores: context.stores,
    capabilities: {
      read_store_status: true,
      read_platform_status: true,
      direct_database_credentials_exposed: false,
      write_operations_enabled: false,
      tiktok_live_publishing_enabled:
        context.capabilities.tiktok_live_publishing_enabled,
    },
  });
}
