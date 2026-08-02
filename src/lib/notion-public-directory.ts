const NOTION_VERSION = "2025-09-03";
const PUBLIC_PROFILE_LIMIT = 50;

type UnknownRecord = Record<string, unknown>;

export interface PublicDirectoryProfile {
  id: string;
  name: string;
  role: string | null;
  division: string | null;
  profileType: string | null;
  bio: string | null;
  verificationStatus: string | null;
  licenseType: string | null;
  licenseAuthority: string | null;
  licenseJurisdiction: string | null;
}

export interface PublicDirectoryResult {
  configured: boolean;
  profiles: PublicDirectoryProfile[];
  status: "ready" | "not_configured" | "provider_error";
}

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function property(properties: unknown, name: string): UnknownRecord | null {
  const values = record(properties);
  return record(values?.[name]);
}

function textValue(value: unknown): string | null {
  const item = record(value);
  if (!item) return null;

  for (const key of ["title", "rich_text"]) {
    const parts = item[key];
    if (!Array.isArray(parts)) continue;
    const text = parts
      .map((part) => {
        const richText = record(part);
        return typeof richText?.plain_text === "string" ? richText.plain_text : "";
      })
      .join("")
      .trim();
    if (text) return text;
  }

  return null;
}

function labelValue(value: unknown): string | null {
  const item = record(value);
  if (!item) return null;

  for (const key of ["select", "status"]) {
    const option = record(item[key]);
    if (typeof option?.name === "string" && option.name.trim()) {
      return option.name.trim();
    }
  }

  return textValue(item);
}

function checkboxValue(value: unknown): boolean {
  return record(value)?.checkbox === true;
}

function normalized(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

export function isApprovedPublicDirectoryPage(page: unknown): boolean {
  const source = record(page);
  const properties = source?.properties;
  if (!properties) return false;

  const approved = checkboxValue(property(properties, "Publish Approved"));
  const visibility = normalized(labelValue(property(properties, "Website Visibility")));
  const audience = normalized(labelValue(property(properties, "Audience")));
  const profileType = normalized(labelValue(property(properties, "Type")));

  if (!approved || visibility !== "public") return false;
  if (audience && audience !== "public") return false;
  if (["vip", "executive board", "private", "internal"].includes(profileType)) return false;

  return true;
}

export function parsePublicDirectoryPage(page: unknown): PublicDirectoryProfile | null {
  if (!isApprovedPublicDirectoryPage(page)) return null;

  const source = record(page);
  const properties = source?.properties;
  if (!properties) return null;

  const name =
    textValue(property(properties, "Profile ID")) ??
    textValue(property(properties, "Name"));
  if (!name) return null;

  const verificationStatus = labelValue(property(properties, "Verification Status"));
  const allowPublicLicense =
    checkboxValue(property(properties, "Public License Display")) &&
    normalized(verificationStatus) === "verified";

  return {
    id: typeof source?.id === "string" ? source.id : name,
    name,
    role: textValue(property(properties, "Role")) ?? labelValue(property(properties, "Role")),
    division:
      textValue(property(properties, "Division")) ??
      labelValue(property(properties, "Division")),
    profileType: labelValue(property(properties, "Type")),
    bio: textValue(property(properties, "Bio")),
    verificationStatus,
    licenseType: allowPublicLicense
      ? labelValue(property(properties, "License Type"))
      : null,
    licenseAuthority: allowPublicLicense
      ? textValue(property(properties, "License Authority")) ??
        labelValue(property(properties, "License Authority"))
      : null,
    licenseJurisdiction: allowPublicLicense
      ? textValue(property(properties, "License Jurisdiction")) ??
        labelValue(property(properties, "License Jurisdiction"))
      : null,
  };
}

function normalizeDataSourceId(value: string | undefined): string | null {
  const candidate = value?.trim().replace(/^collection:\/\//, "") ?? "";
  return /^[a-f0-9-]{32,36}$/i.test(candidate) ? candidate : null;
}

export async function getPublicDirectory(
  env: Pick<NodeJS.ProcessEnv, "NOTION_API_TOKEN" | "NOTION_PERSONNEL_DATA_SOURCE_ID"> = process.env,
  request: typeof fetch = fetch,
): Promise<PublicDirectoryResult> {
  const token = env.NOTION_API_TOKEN?.trim();
  const dataSourceId = normalizeDataSourceId(env.NOTION_PERSONNEL_DATA_SOURCE_ID);

  if (!token || !dataSourceId) {
    return { configured: false, profiles: [], status: "not_configured" };
  }

  try {
    const response = await request(
      `https://api.notion.com/v1/data_sources/${encodeURIComponent(dataSourceId)}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify({
          page_size: PUBLIC_PROFILE_LIMIT,
          filter: {
            and: [
              { property: "Publish Approved", checkbox: { equals: true } },
              { property: "Website Visibility", select: { equals: "Public" } },
            ],
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return { configured: true, profiles: [], status: "provider_error" };
    }

    const payload = record(await response.json());
    const results = Array.isArray(payload?.results) ? payload.results : [];
    const profiles = results
      .map(parsePublicDirectoryPage)
      .filter((item): item is PublicDirectoryProfile => item !== null);

    return { configured: true, profiles, status: "ready" };
  } catch {
    return { configured: true, profiles: [], status: "provider_error" };
  }
}
