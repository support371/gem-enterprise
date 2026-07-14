export type WorkspaceAdministrationContext = {
  actorUserId: string;
  ipAddress: string;
  userAgent: string;
};

export class WorkspaceAdministrationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "WorkspaceAdministrationError";
  }
}

export function workspaceConflict(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 409, code);
}

export function workspaceInvalid(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 400, code);
}

export function workspaceMissing(message: string, code: string): never {
  throw new WorkspaceAdministrationError(message, 404, code);
}

export function normalizeWorkspaceEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeWorkspaceRoleName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
