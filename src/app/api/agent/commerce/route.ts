import { getAgentStoreSummary, jsonNoStore, requireGemAgent } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireGemAgent(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const channel = url.searchParams.get("channel")?.trim().toLowerCase();
  const stores = getAgentStoreSummary();

  if (channel === "tiktok") {
    return jsonNoStore({ ok: true, channel: "tiktok", store: stores.tiktok });
  }

  if (channel === "google") {
    return jsonNoStore({ ok: true, channel: "google", store: stores.google });
  }

  return jsonNoStore({ ok: true, channels: stores });
}
