import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-helpers";
import { db } from "@/lib/db";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            entityType: true,
          },
        },
      },
    });

    return json({
      users,
      pagination: {
        page: 1,
        limit: 100,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/admin/users]", error);
    return json({ error: "Unable to load users", users: [] }, 500);
  }
}

export async function POST() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  return json(
    {
      error:
        "User creation requires an invitation workflow and audit confirmation before activation.",
    },
    501,
  );
}
