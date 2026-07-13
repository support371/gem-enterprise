import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api/auth-helpers";
import type { CommandCenterSnapshot } from "@/lib/commandCenterSnapshot";
import { buildCommandCenterSnapshot } from "@/lib/commandCenterSnapshotService";

export const dynamic = "force-dynamic";

function json(snapshot: CommandCenterSnapshot, status = 200) {
  return NextResponse.json(snapshot, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function GET() {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  return json(await buildCommandCenterSnapshot());
}
