import { getAgentPlatformContext, jsonNoStore, requireGemAgent } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireGemAgent(request);
  if (denied) return denied;

  const context = await getAgentPlatformContext();
  const view = new URL(request.url).searchParams.get("view")?.toLowerCase();

  if (view === "stores") {
    return jsonNoStore({ ok: true, stores: context.stores });
  }

  if (view === "tiktok") {
    return jsonNoStore({ ok: true, store: "tiktok", ...context.stores.tiktok });
  }

  if (view === "google") {
    return jsonNoStore({ ok: true, store: "google", ...context.stores.google });
  }

  return jsonNoStore(context);
}
