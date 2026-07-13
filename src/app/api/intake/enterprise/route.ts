import { NextRequest } from "next/server";
import { enterpriseApplicationSchema } from "@/lib/intake/schemas";
import { handlePublicIntake } from "@/lib/intake/submit";

export async function POST(request: NextRequest) {
  return handlePublicIntake(request, {
    kind: "ENTERPRISE",
    schema: enterpriseApplicationSchema,
  });
}
