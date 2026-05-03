import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await db.portfolioMembership.findMany({
    where: { userId: session.userId },
    include: {
      portfolio: true,
    },
    orderBy: { assignedAt: "desc" },
  });

  const portfolios = memberships.map(m => ({
    ...m.portfolio,
    totalValue: m.portfolio.totalValue?.toString() ?? null,
    role: m.role,
    assignedAt: m.assignedAt,
  }));

  return NextResponse.json({ portfolios });
}
