import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const roles = [
  {
    id: "client",
    name: "Client",
    permissions: ["portal:read", "requests:create", "documents:read", "support:create", "meetings:create"],
  },
  {
    id: "analyst",
    name: "Analyst",
    permissions: ["portal:read", "kyc:review", "support:review", "intel:review"],
  },
  {
    id: "admin",
    name: "Admin",
    permissions: ["admin:read", "admin:write", "kyc:decision", "users:review", "audit:read"],
  },
  {
    id: "super_admin",
    name: "Super Admin",
    permissions: ["admin:*", "security:*", "platform:*", "audit:*"],
  },
  {
    id: "internal",
    name: "Internal",
    permissions: ["portal:read", "support:review", "requests:review"],
  },
];

function isAdminRole(role: string) {
  return role === "admin" || role === "super_admin";
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", roles: [] }, { status: 401 });
  }

  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden", roles: [] }, { status: 403 });
  }

  return NextResponse.json({ roles });
}

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    {
      error: "Custom role creation requires persisted role and permission tables before activation.",
    },
    { status: 501 },
  );
}
