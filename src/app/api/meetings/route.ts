import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meetings = await db.meetingRequest.findMany({
    where: {
      OR: [
        { requesterId: session.userId },
        { hostId: session.userId },
      ],
    },
    orderBy: { proposedAt: "asc" },
    include: {
      requester: {
        select: {
          email: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return NextResponse.json({ meetings });
}

const CreateSchema = z.object({
  topic: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  proposedAt: z.string().datetime(),
  duration: z.number().int().min(15).max(240).default(30),
  hostId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const meeting = await db.meetingRequest.create({
    data: {
      requesterId: session.userId,
      topic: parsed.data.topic,
      description: parsed.data.description,
      proposedAt: new Date(parsed.data.proposedAt),
      duration: parsed.data.duration,
      hostId: parsed.data.hostId,
    },
  });

  return NextResponse.json({ meeting }, { status: 201 });
}
