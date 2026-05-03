import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await db.kYCApplication.findMany({
    where: { userId: session.userId },
    select: {
      id: true,
      documents: {
        select: {
          id: true,
          documentType: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const documents = applications.flatMap(a => a.documents);

  return NextResponse.json({ documents });
}
