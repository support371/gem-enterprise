import { describe, expect, it } from "vitest";
import { commandRunnerCommands, getCommandRunnerCommand } from "@/lib/command-runner/catalog";

describe("command runner catalog", () => {
  it("contains only unique fixed command ids", () => {
    const ids = commandRunnerCommands.map((command) => command.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not expose destructive or production-changing actions", () => {
    const ids = commandRunnerCommands.map((command) => command.id);
    expect(ids).not.toContain("shell");
    expect(ids).not.toContain("deploy");
    expect(ids).not.toContain("db-push");
    expect(ids).not.toContain("db-migrate");
    expect(ids).not.toContain("delete");
  });

  it("rejects unknown command ids", () => {
    expect(getCommandRunnerCommand("powershell -Command whoami")).toBeNull();
  });
});
