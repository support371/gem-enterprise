import type { CommandCenterSnapshot } from "@/lib/commandCenterSnapshot";
import {
  commandCenterOperatingMetricLabels,
  commandCenterSnapshotLabels,
} from "@/lib/commandCenterSnapshot";

export type CommandCenterExportFormat = "csv" | "json";

function csvCell(value: string | number | null | undefined): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function csvRow(values: Array<string | number | null | undefined>): string {
  return values.map(csvCell).join(",");
}

export function commandCenterExportFilename(
  format: CommandCenterExportFormat,
  generatedAt: string,
): string {
  const timestamp = generatedAt.replace(/[:.]/g, "-");
  return `gem-command-center-${timestamp}.${format}`;
}

export function commandCenterSnapshotToCsv(snapshot: CommandCenterSnapshot): string {
  const rows: string[] = [csvRow(["section", "metric", "value", "source", "generated_at"])];

  if (snapshot.metrics) {
    for (const metric of commandCenterSnapshotLabels) {
      rows.push(
        csvRow([
          "platform",
          metric.label,
          snapshot.metrics[metric.key],
          snapshot.source,
          snapshot.generatedAt,
        ]),
      );
    }
  } else {
    rows.push(
      csvRow([
        "platform",
        "snapshot_status",
        snapshot.message ?? "unavailable",
        snapshot.source,
        snapshot.generatedAt,
      ]),
    );
  }

  if (snapshot.operatingLayer.metrics) {
    for (const metric of commandCenterOperatingMetricLabels) {
      rows.push(
        csvRow([
          "operating_layer",
          metric.label,
          snapshot.operatingLayer.metrics[metric.key],
          snapshot.operatingLayer.source,
          snapshot.generatedAt,
        ]),
      );
    }
  } else {
    rows.push(
      csvRow([
        "operating_layer",
        "readiness_status",
        snapshot.operatingLayer.message ?? snapshot.operatingLayer.source,
        snapshot.operatingLayer.source,
        snapshot.generatedAt,
      ]),
    );
    rows.push(
      csvRow([
        "operating_layer",
        "missing_table_count",
        snapshot.operatingLayer.missingTables?.length ?? 0,
        snapshot.operatingLayer.source,
        snapshot.generatedAt,
      ]),
    );
  }

  return `${rows.join("\r\n")}\r\n`;
}
