import { describe, expect, it, vi } from "vitest";
import {
  probeGoogleMerchantFeed,
  validateGoogleMerchantXml,
} from "@/lib/googleMerchantFeedHealth";

const VALID_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GEM Store</title>
    <link>https://example.com</link>
    <description>Physical products</description>
    <item>
      <g:id>PHYS-001</g:id>
      <g:title>Physical Security Kit</g:title>
      <g:description>A boxed physical product.</g:description>
      <g:link>https://example.com/products/PHYS-001</g:link>
      <g:image_link>https://example.com/images/PHYS-001.jpg</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>49.99 USD</g:price>
      <g:condition>new</g:condition>
    </item>
  </channel>
</rss>`;

describe("Google Merchant feed XML validation", () => {
  it("accepts a valid RSS feed with the Google namespace", () => {
    const result = validateGoogleMerchantXml(VALID_FEED);

    expect(result.valid).toBe(true);
    expect(result.itemCount).toBe(1);
    expect(result.uniqueProductIds).toBe(1);
    expect(result.duplicateProductIds).toEqual([]);
  });

  it("detects missing required product fields", () => {
    const xml = VALID_FEED.replace(
      "<g:image_link>https://example.com/images/PHYS-001.jpg</g:image_link>",
      "",
    );
    const result = validateGoogleMerchantXml(xml);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_required_item_field",
          field: "image_link",
        }),
      ]),
    );
  });

  it("detects duplicate product IDs", () => {
    const item = VALID_FEED.match(/<item>[\s\S]*?<\/item>/)?.[0] ?? "";
    const xml = VALID_FEED.replace("</channel>", `${item}</channel>`);
    const result = validateGoogleMerchantXml(xml);

    expect(result.valid).toBe(false);
    expect(result.itemCount).toBe(2);
    expect(result.duplicateProductIds).toEqual(["PHYS-001"]);
  });

  it("rejects feeds without the Google namespace", () => {
    const result = validateGoogleMerchantXml(
      VALID_FEED.replace(' xmlns:g="http://base.google.com/ns/1.0"', ""),
    );

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing_google_namespace" }),
      ]),
    );
  });
});

describe("Google Merchant feed probe", () => {
  it("returns healthy for a successful XML response", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(VALID_FEED, {
        status: 200,
        headers: { "content-type": "application/xml; charset=utf-8" },
      }),
    ) as unknown as typeof fetch;

    const result = await probeGoogleMerchantFeed("https://example.com/feed.xml", {
      fetchImpl,
    });

    expect(result.ok).toBe(true);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.validation.itemCount).toBe(1);
  });

  it("rejects non-XML content types", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(VALID_FEED, {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    ) as unknown as typeof fetch;

    const result = await probeGoogleMerchantFeed("https://example.com/feed.xml", {
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_content_type" }),
      ]),
    );
  });

  it("reports HTTP failures", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain" },
      }),
    ) as unknown as typeof fetch;

    const result = await probeGoogleMerchantFeed("https://example.com/feed.xml", {
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.reachable).toBe(true);
    expect(result.statusCode).toBe(404);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "http_error" }),
      ]),
    );
  });

  it("rejects unsafe feed URLs before making a request", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await probeGoogleMerchantFeed("http://localhost/feed.xml", {
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.issues[0]?.code).toBe("unsafe_feed_url");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports network failures without exposing stack traces", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network unavailable");
    }) as unknown as typeof fetch;

    const result = await probeGoogleMerchantFeed("https://example.com/feed.xml", {
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.reachable).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: "request_failed",
        message: "network unavailable",
      }),
    ]);
  });
});
