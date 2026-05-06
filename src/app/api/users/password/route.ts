import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db";
import { emitAuditLog } from "@/lib/audit";
import { requireSession, getRequestContext, badRequest } from "@/lib/api/auth-helpers";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(256),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(256),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  });

export async function PATCH(req: NextRequest) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;
  const session = gate.session;
  const { ipAddress, userAgent } = getRequestContext(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcryptjs.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }

  const passwordHash = await bcryptjs.hash(newPassword, 12);
  await db.user.update({ where: { id: session.userId }, data: { passwordHash } });

  await emitAuditLog({
    userId: session.userId,
    action: "password_change",
    resource: "user",
    resourceId: session.userId,
    metadata: { email: session.email },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
