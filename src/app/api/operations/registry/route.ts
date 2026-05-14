import { NextResponse } from "next/server";
import {
  agentOperatingInstructions,
  getApprovalRequiredOperations,
  getReadyOperations,
  operationsRegistry,
} from "@/lib/saasOperationsRegistry";

export async function GET() {
  const ready = getReadyOperations();
  const approvalRequired = getApprovalRequiredOperations();

  return NextResponse.json({
    instructions: agentOperatingInstructions,
    summary: {
      total: operationsRegistry.length,
      ready: ready.length,
      approvalRequired: approvalRequired.length,
      external: operationsRegistry.filter((operation) => operation.mode === "external").length,
      partial: operationsRegistry.filter((operation) => operation.mode === "partial").length,
      planned: operationsRegistry.filter((operation) => operation.mode === "planned").length,
    },
    operations: operationsRegistry,
  });
}
