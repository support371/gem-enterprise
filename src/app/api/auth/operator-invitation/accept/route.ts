import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GatewayRequestError } from "@/lib/supabase-gateway";
import { consumeOperatorInvitation } from "@/lib/operator-invitations-gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .refine((value) => /[a-z]/.test(value), "Password requires a lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Password requires an uppercase letter.")
  .refine((value) => /\d/.test(value), "Password requires a number.")
  .refine((value) => /[^A-Za-z0-9]/.test(value), "Password requires a symbol.");

const schema = z
  .object({
    token: z.string().min(40).max(256),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
    firstName: z.string().trim().max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "Operator account details are invalid.",
        details: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const result = await consumeOperatorInvitation({
      tokenHash,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
    });
    return json({
      ok: true,
      email: result.email,
      role: result.role,
      redirect: "/client-login",
      credentialsExposed: false,
    });
  } catch (error) {
    if (error instanceof GatewayRequestError) {
      return json({ error: error.message, code: error.code }, error.statusCode);
    }
    return json({ error: "Operator account could not be created." }, 503);
  }
}
