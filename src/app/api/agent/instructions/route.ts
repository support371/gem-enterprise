import { NextResponse } from "next/server";
import { agentOperatingInstructions } from "@/lib/saasOperationsRegistry";

export async function GET() {
  return NextResponse.json({
    instructions: agentOperatingInstructions,
  });
}
