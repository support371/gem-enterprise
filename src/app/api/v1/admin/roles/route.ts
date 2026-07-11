import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-helpers";

const roles = [
  {
    id: "client",
    name: "Client",
    permissions: [
      "portal:read",
      "requests:create",
      "documents:read",
      "support:create",
      "meetings:create",
    ],
  },
  {
    id: "analyst",
    name: "Analyst",
    permissions: ["portal:read", "kyc:review", "support:review", "intel:review"],
  },
  {
    id: "admin",
    name: "Admin",
    permissions: [
      "admin:read",
      "admin:write",
      "kyc:decision",
      "users:review",
      "audit:read",
    ],
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

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  return json({ roles });
}

export async function POST() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  return json(
    {
      error:
        "Custom role creation requires persisted role and permission tables before activation.",
    },
    501,
  );
}
