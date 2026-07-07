import { getAgentStoreSummary, jsonNoStore, requireGemAgent } from "@/lib/agentBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireGemAgent(request);
  if (denied) return denied;

  const channel = new URL(request.url).searchParams.get("channel")?.toLowerCase();
  const stores = getAgentStoreSummary();

  if (channel === "tiktok") {
    return jsonNoStore({ ok: true, channel, store: stores.tiktok });
  }

  if (channel === "google") {
    return jsonNoStore({ ok: true, channel, store: stores.google });
  }

  return jsonNoStore({
    ok: false,
    error: "unsupported_channel",
    supported_channels: ["tiktok", "google"],
  }, 400);
}
