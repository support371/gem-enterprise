export const commandRunnerCommands = [
  {
    id: "repo-status",
    label: "Repository status",
    description: "Read the current branch and working-tree status on the authorized host.",
    timeoutMs: 30_000,
  },
  {
    id: "lint",
    label: "Lint",
    description: "Run the repository ESLint gate.",
    timeoutMs: 180_000,
  },
  {
    id: "typecheck",
    label: "Type check",
    description: "Run the TypeScript no-emit validation gate.",
    timeoutMs: 180_000,
  },
  {
    id: "test",
    label: "Unit tests",
    description: "Run the repository Vitest suite once.",
    timeoutMs: 600_000,
  },
  {
    id: "verify-preview",
    label: "Preview verification",
    description: "Run schema checks, claims checks, lint, typecheck, and tests without a production deployment.",
    timeoutMs: 900_000,
  },
  {
    id: "build",
    label: "Production build",
    description: "Run the repository production build locally without deploying it.",
    timeoutMs: 900_000,
  },
] as const;

export type CommandRunnerCommandId = (typeof commandRunnerCommands)[number]["id"];

export function getCommandRunnerCommand(commandId: string) {
  return commandRunnerCommands.find((command) => command.id === commandId) ?? null;
}
