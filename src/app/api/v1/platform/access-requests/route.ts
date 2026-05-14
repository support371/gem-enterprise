import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", accessRequests: [] }, { status: 401 });
  }

  if (session.role !== "admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden", accessRequests: [] }, { status: 403 });
  }

  return NextResponse.json({
    accessRequests: [],
    message: "No persisted access request store is configured yet.",
  });
}

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error: "Access request creation requires a persisted approval workflow before activation.",
    },
    { status: 501 },
  );
}
