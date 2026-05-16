import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

function isAdminRole(role: string) {
  return role === "admin" || role === "super_admin";
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized", users: [] }, { status: 401 });
  }

  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden", users: [] }, { status: 403 });
  }

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

  return NextResponse.json({
    users,
    pagination: {
      page: 1,
      limit: 100,
      total: users.length,
    },
  });
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
      error: "User creation requires an invitation workflow and audit confirmation before activation.",
    },
    { status: 501 },
  );
}
