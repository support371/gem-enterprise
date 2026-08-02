import { describe, expect, it, vi } from "vitest";
import {
  getPublicDirectory,
  isApprovedPublicDirectoryPage,
  parsePublicDirectoryPage,
} from "./notion-public-directory";

function richText(value: string) {
  return { rich_text: [{ plain_text: value }] };
}

function title(value: string) {
  return { title: [{ plain_text: value }] };
}

function select(value: string) {
  return { select: { name: value } };
}

function page(overrides: Record<string, unknown> = {}) {
  return {
    id: "profile-1",
    properties: {
      "Profile ID": title("Verified Specialist"),
      Type: select("Expert"),
      Role: richText("Security Consultant"),
      Division: richText("Cybersecurity"),
      Audience: select("Public"),
      "Website Visibility": select("Public"),
      "Publish Approved": { checkbox: true },
      "Verification Status": select("Verified"),
      "Public License Display": { checkbox: true },
      "License Type": select("Professional License"),
      "License Authority": richText("Authoritative Registry"),
      "License Jurisdiction": richText("Florida"),
      "License Number": richText("must-never-be-returned"),
      "Evidence Files": { files: [{ name: "private.pdf" }] },
      "Internal Notes": richText("must-never-be-returned"),
      ...overrides,
    },
  };
}

describe("Notion public personnel directory", () => {
  it("requires explicit publication approval and public visibility", () => {
    expect(isApprovedPublicDirectoryPage(page())).toBe(true);
    expect(
      isApprovedPublicDirectoryPage(page({ "Publish Approved": { checkbox: false } })),
    ).toBe(false);
    expect(
      isApprovedPublicDirectoryPage(page({ "Website Visibility": select("Hidden") })),
    ).toBe(false);
    expect(isApprovedPublicDirectoryPage(page({ Audience: select("VIP") }))).toBe(false);
  });

  it("returns only public presentation fields", () => {
    const profile = parsePublicDirectoryPage(page());

    expect(profile).toMatchObject({
      name: "Verified Specialist",
      role: "Security Consultant",
      division: "Cybersecurity",
      verificationStatus: "Verified",
      licenseAuthority: "Authoritative Registry",
    });
    expect(profile).not.toHaveProperty("licenseNumber");
    expect(profile).not.toHaveProperty("evidenceFiles");
    expect(profile).not.toHaveProperty("internalNotes");
  });

  it("hides license presentation until verification is complete", () => {
    const profile = parsePublicDirectoryPage(
      page({ "Verification Status": select("In Review") }),
    );

    expect(profile?.licenseType).toBeNull();
    expect(profile?.licenseAuthority).toBeNull();
    expect(profile?.licenseJurisdiction).toBeNull();
  });

  it("fails closed when provider configuration is absent", async () => {
    const request = vi.fn();
    const result = await getPublicDirectory({}, request as unknown as typeof fetch);

    expect(result).toEqual({
      configured: false,
      profiles: [],
      status: "not_configured",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("fails closed when Notion returns an error", async () => {
    const request = vi.fn().mockResolvedValue(new Response("denied", { status: 403 }));
    const result = await getPublicDirectory(
      {
        NOTION_API_TOKEN: "server-only-token",
        NOTION_PERSONNEL_DATA_SOURCE_ID: "7b16d9dea86e4aed8ab77c9b937d3abc",
      },
      request as unknown as typeof fetch,
    );

    expect(result).toEqual({
      configured: true,
      profiles: [],
      status: "provider_error",
    });
  });

  it("applies the publication gates to the provider query", async () => {
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [page()] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await getPublicDirectory(
      {
        NOTION_API_TOKEN: "server-only-token",
        NOTION_PERSONNEL_DATA_SOURCE_ID: "collection://7b16d9de-a86e-4aed-8ab7-7c9b937d3abc",
      },
      request as unknown as typeof fetch,
    );

    expect(result.status).toBe("ready");
    expect(result.profiles).toHaveLength(1);
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining("/data_sources/7b16d9de-a86e-4aed-8ab7-7c9b937d3abc/query"),
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      }),
    );

    const options = request.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(options.body))).toMatchObject({
      filter: {
        and: [
          { property: "Publish Approved", checkbox: { equals: true } },
          { property: "Website Visibility", select: { equals: "Public" } },
        ],
      },
    });
  });
});
