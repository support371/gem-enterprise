import { NextRequest, NextResponse } from "next/server";
import { correlationId, emitTokMetricAudit, requireTokMetricSession, requireWorkspaceAccess, tokMetricErrorResponse } from "@/lib/tokmetric/security";
import { getAuthorizedTikTokShops, searchTikTokShopProducts } from "@/lib/tokmetric/shop/client";
import { getTikTokShopSellerCredential } from "@/lib/tokmetric/shop/connectors";

export async function GET(request: NextRequest) {
  const cid = correlationId(request);
  try {
    const session = await requireTokMetricSession(request);
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "workspaceId is required", correlationId: cid } }, { status: 400 });
    await requireWorkspaceAccess(workspaceId, session);
    const { connector, credential } = await getTikTokShopSellerCredential(workspaceId);
    const shopsPayload = await getAuthorizedTikTokShops(credential.access_token);
    const shops = Array.isArray(shopsPayload?.data?.shops) ? shopsPayload.data.shops : [];
    const selectedShop = shops[0];
    const shopCipher = selectedShop?.cipher || selectedShop?.shop_cipher;
    const productsPayload = shopCipher ? await searchTikTokShopProducts(credential.access_token, shopCipher) : null;
    const products = Array.isArray(productsPayload?.data?.products) ? productsPayload.data.products : [];
    await emitTokMetricAudit({ workspaceId, actorId: session.userId, action: "tokmetric.shop.catalog_read", entityType: "connector", entityId: connector.id, correlationId: cid, outcome: "success", sourceChannel: "website", metadata: { shopCount: shops.length, productCount: products.length, writePerformed: false } });
    return NextResponse.json({ ok: true, correlationId: cid, connector: { id: connector.id, displayName: connector.displayName, state: connector.state }, shops, products, source: "LIVE_TIKTOK_SHOP", readOnly: true });
  } catch (error) {
    return tokMetricErrorResponse(error, cid);
  }
}
