import { NextRequest } from "next/server";
import { handlePasswordReset } from "@/lib/passwordResetHandler";

export async function POST(request: NextRequest) {
  return handlePasswordReset(request);
}
