import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// TODO(v2): implement Webhook model and CRUD when webhook delivery is built
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ webhooks: [], note: "Webhook management available in v2." });
}
