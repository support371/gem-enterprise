import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db.apiKey.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ keys });
}

const CreateSchema = z.object({
  label: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const rawKey = `gem_${crypto.randomBytes(32).toString("hex")}`;
  const keyPrefix = rawKey.slice(0, 10);
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const key = await db.apiKey.create({
    data: {
      userId: session.userId,
      label: parsed.data.label,
      keyHash,
      keyPrefix,
    },
    select: { id: true, label: true, keyPrefix: true, createdAt: true },
  });

  return NextResponse.json({ key, plaintext: rawKey }, { status: 201 });
}
