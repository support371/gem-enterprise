import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/api/auth-helpers";

export async function GET() {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  const tickets = await db.supportTicket.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 100,
    select: {
      id: true,
      userId: true,
      subject: true,
      description: true,
      status: true,
      priority: true,
      assignedTo: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      user: {
        select: {
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return NextResponse.json(
    { ok: true, tickets, operator: { id: gate.session.userId, role: gate.session.role } },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
