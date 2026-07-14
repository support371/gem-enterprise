import { describe, expect, it } from "vitest";
import { resolveServiceRequestScope } from "@/lib/serviceRequestScope";

const workspaces = [
  { id: "workspace_alpha", name: "Alpha" },
  { id: "workspace_beta", name: "Beta" },
] as const;

describe("service request scope resolution", () => {
  it("defaults to explicit personal scope", () => {
    expect(resolveServiceRequestScope(workspaces, null)).toEqual({
      kind: "personal",
      requestedWorkspaceId: null,
      workspace: null,
    });
    expect(resolveServiceRequestScope(workspaces, "   ")).toEqual({
      kind: "personal",
      requestedWorkspaceId: null,
      workspace: null,
    });
  });

  it("returns only a workspace present in the accessible set", () => {
    expect(resolveServiceRequestScope(workspaces, " workspace_beta ")).toEqual({
      kind: "workspace",
      requestedWorkspaceId: "workspace_beta",
      workspace: { id: "workspace_beta", name: "Beta" },
    });
  });

  it("denies a workspace outside the accessible set", () => {
    expect(resolveServiceRequestScope(workspaces, "workspace_other")).toEqual({
      kind: "denied",
      requestedWorkspaceId: "workspace_other",
      workspace: null,
    });
  });

  it("does not treat an empty accessible set as permission", () => {
    expect(resolveServiceRequestScope([], "workspace_alpha")).toEqual({
      kind: "denied",
      requestedWorkspaceId: "workspace_alpha",
      workspace: null,
    });
  });
});
