import { NextRequest } from "next/server";
import { productRequestSchema } from "@/lib/intake/schemas";
import { handlePublicIntake } from "@/lib/intake/submit";

export async function POST(request: NextRequest) {
  return handlePublicIntake(request, {
    kind: "PRODUCT_REQUEST",
    schema: productRequestSchema,
  });
}
