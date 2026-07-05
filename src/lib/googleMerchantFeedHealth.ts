import { isPublicHttpsUrl } from "@/lib/googleMerchantReadiness";

const GOOGLE_NAMESPACE = "http://base.google.com/ns/1.0";
const DEFAULT_TIMEOUT_MS = 8_000;
const MAX_FEED_BYTES = 5 * 1024 * 1024;

export type GoogleMerchantFeedIssueCode =
  | "unsafe_feed_url"
  | "request_failed"
  | "request_timeout"
  | "http_error"
  | "invalid_content_type"
  | "feed_too_large"
  | "empty_feed"
  | "missing_rss_root"
  | "missing_google_namespace"
  | "missing_channel"
  | "missing_required_item_field"
  | "duplicate_product_id";

export type GoogleMerchantFeedIssue = {
  code: GoogleMerchantFeedIssueCode;
  message: string;
  itemIndex?: number;
  field?: string;
};

export type GoogleMerchantXmlValidation = {
  valid: boolean;
  itemCount: number;
  uniqueProductIds: number;
  duplicateProductIds: string[];
  issues: GoogleMerchantFeedIssue[];
};

export type GoogleMerchantFeedHealth = {
  ok: boolean;
  checkedAt: string;
  feedUrl: string;
  reachable: boolean;
  statusCode: number | null;
  contentType: string | null;
  responseBytes: number | null;
  latencyMs: number;
  validation: GoogleMerchantXmlValidation;
  issues: GoogleMerchantFeedIssue[];
};

const REQUIRED_ITEM_FIELDS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
] as const;

function emptyValidation(issues: GoogleMerchantFeedIssue[] = []): GoogleMerchantXmlValidation {
  return {
    valid: false,
    itemCount: 0,
    uniqueProductIds: 0,
    duplicateProductIds: [],
    issues,
  };
}

function extractTagValue(itemXml: string, tagName: string): string {
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = itemXml.match(
    new RegExp(`<g:${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/g:${escapedTag}>`, "i"),
  );
  return match?.[1]?.trim() ?? "";
}

export function validateGoogleMerchantXml(xml: string): GoogleMerchantXmlValidation {
  const issues: GoogleMerchantFeedIssue[] = [];
  const trimmedXml = xml.trim();

  if (!trimmedXml) {
    issues.push({ code: "empty_feed", message: "The feed response is empty." });
    return emptyValidation(issues);
  }

  if (!/<rss(?:\s|>)/i.test(trimmedXml)) {
    issues.push({ code: "missing_rss_root", message: "The feed is missing an RSS root element." });
  }

  const namespacePattern = new RegExp(
    `xmlns:g=["']${GOOGLE_NAMESPACE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i",
  );
  if (!namespacePattern.test(trimmedXml)) {
    issues.push({
      code: "missing_google_namespace",
      message: `The RSS root must declare xmlns:g=\"${GOOGLE_NAMESPACE}\".`,
    });
  }

  if (!/<channel(?:\s|>)/i.test(trimmedXml)) {
    issues.push({ code: "missing_channel", message: "The feed is missing an RSS channel element." });
  }

  const itemMatches = [...trimmedXml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  const productIds: string[] = [];

  itemMatches.forEach((match, itemIndex) => {
    const itemXml = match[1] ?? "";

    for (const field of REQUIRED_ITEM_FIELDS) {
      const value = extractTagValue(itemXml, field);
      if (!value) {
        issues.push({
          code: "missing_required_item_field",
          message: `Item ${itemIndex + 1} is missing g:${field}.`,
          itemIndex,
          field,
        });
      }
    }

    const productId = extractTagValue(itemXml, "id");
    if (productId) productIds.push(productId);
  });

  const counts = new Map<string, number>();
  for (const productId of productIds) {
    counts.set(productId, (counts.get(productId) ?? 0) + 1);
  }

  const duplicateProductIds = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([productId]) => productId)
    .sort((a, b) => a.localeCompare(b));

  for (const productId of duplicateProductIds) {
    issues.push({
      code: "duplicate_product_id",
      message: `The feed contains duplicate product ID ${productId}.`,
    });
  }

  return {
    valid: issues.length === 0,
    itemCount: itemMatches.length,
    uniqueProductIds: counts.size,
    duplicateProductIds,
    issues,
  };
}

export async function probeGoogleMerchantFeed(
  feedUrl: string,
  options: {
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<GoogleMerchantFeedHealth> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!isPublicHttpsUrl(feedUrl)) {
    const issue: GoogleMerchantFeedIssue = {
      code: "unsafe_feed_url",
      message: "The configured feed URL must be a public HTTPS URL.",
    };
    return {
      ok: false,
      checkedAt,
      feedUrl,
      reachable: false,
      statusCode: null,
      contentType: null,
      responseBytes: null,
      latencyMs: Date.now() - startedAt,
      validation: emptyValidation([issue]),
      issues: [issue],
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(feedUrl, {
      method: "GET",
      headers: {
        Accept: "application/xml,text/xml,application/rss+xml;q=0.9,*/*;q=0.1",
        "User-Agent": "GEM-Google-Merchant-Feed-Monitor/1.0",
      },
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type");
    const contentLength = Number(response.headers.get("content-length"));
    const issues: GoogleMerchantFeedIssue[] = [];

    if (!response.ok) {
      issues.push({
        code: "http_error",
        message: `The feed returned HTTP ${response.status}.`,
      });
    }

    if (!contentType || !/(?:application|text)\/(?:[^;]+\+)?xml|application\/rss\+xml/i.test(contentType)) {
      issues.push({
        code: "invalid_content_type",
        message: `Expected an XML content type but received ${contentType ?? "none"}.`,
      });
    }

    if (Number.isFinite(contentLength) && contentLength > MAX_FEED_BYTES) {
      const issue: GoogleMerchantFeedIssue = {
        code: "feed_too_large",
        message: `The feed exceeds the ${MAX_FEED_BYTES}-byte monitoring limit.`,
      };
      issues.push(issue);
      return {
        ok: false,
        checkedAt,
        feedUrl,
        reachable: true,
        statusCode: response.status,
        contentType,
        responseBytes: contentLength,
        latencyMs: Date.now() - startedAt,
        validation: emptyValidation([issue]),
        issues,
      };
    }

    const body = await response.text();
    const responseBytes = new TextEncoder().encode(body).byteLength;

    if (responseBytes > MAX_FEED_BYTES) {
      const issue: GoogleMerchantFeedIssue = {
        code: "feed_too_large",
        message: `The feed exceeds the ${MAX_FEED_BYTES}-byte monitoring limit.`,
      };
      issues.push(issue);
      return {
        ok: false,
        checkedAt,
        feedUrl,
        reachable: true,
        statusCode: response.status,
        contentType,
        responseBytes,
        latencyMs: Date.now() - startedAt,
        validation: emptyValidation([issue]),
        issues,
      };
    }

    const validation = validateGoogleMerchantXml(body);
    const combinedIssues = [...issues, ...validation.issues];

    return {
      ok: response.ok && issues.length === 0 && validation.valid,
      checkedAt,
      feedUrl,
      reachable: true,
      statusCode: response.status,
      contentType,
      responseBytes,
      latencyMs: Date.now() - startedAt,
      validation,
      issues: combinedIssues,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    const issue: GoogleMerchantFeedIssue = {
      code: timedOut ? "request_timeout" : "request_failed",
      message: timedOut
        ? `The feed did not respond within ${timeoutMs}ms.`
        : error instanceof Error
          ? error.message
          : "The feed request failed.",
    };

    return {
      ok: false,
      checkedAt,
      feedUrl,
      reachable: false,
      statusCode: null,
      contentType: null,
      responseBytes: null,
      latencyMs: Date.now() - startedAt,
      validation: emptyValidation([issue]),
      issues: [issue],
    };
  } finally {
    clearTimeout(timeout);
  }
}
