import { invokeEvidenceGatewayRoute } from "@/lib/kyc/evidence-gateway-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return invokeEvidenceGatewayRoute("readiness");
}
