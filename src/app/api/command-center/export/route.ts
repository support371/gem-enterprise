import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/api/auth-helpers";
import {
  commandCenterExportFilename,
  commandCenterSnapshotToCsv,
} from "@/lib/commandCenterExport";
import { buildCommandCenterSnapshot } from "@/lib/commandCenterSnapshotService";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
});

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return gate.response;

  const parsed = querySchema.safeParse({
    format: request.nextUrl.searchParams.get("format") ?? "csv",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unsupported export format. Use csv or json." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const snapshot = await buildCommandCenterSnapshot();
  const filename = commandCenterExportFilename(parsed.data.format, snapshot.generatedAt);

  if (parsed.data.format === "json") {
    return NextResponse.json(snapshot, {
      headers: {
        ...noStoreHeaders,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return new Response(`\uFEFF${commandCenterSnapshotToCsv(snapshot)}`, {
    status: 200,
    headers: {
      ...noStoreHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
