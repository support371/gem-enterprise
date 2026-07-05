# Google Merchant Phase 4 — Activation and Feed Health

## Purpose

Phase 4 verifies that the hosted Google Merchant XML feed is safe to hand off to Google Merchant Center.

It is stacked on Phase 3 and remains independent of Google Cloud billing, OAuth, service-account credentials, and Merchant API registration.

## Dependencies

Phase 4 requires:

1. Phase 2 to deploy the hosted XML feed.
2. Phase 3 to validate catalogue eligibility.
3. A public HTTPS feed URL configured through `GOOGLE_MERCHANT_FEED_URL`.

Default expected feed URL:

```text
https://superagent-17ea9ea1.base44.app/functions/googleMerchantFeed.xml
```

## Added routes

### Operations dashboard

```text
/store/google/operations
```

Displays:

- Feed reachability
- HTTP status
- Response content type
- Response size and latency
- Parsed item count
- XML validation result
- Catalogue eligibility result
- Combined activation gate
- Merchant Center handoff values
- Feed blockers

### Feed-health API

```text
/api/google-merchant/feed-health
```

Returns HTTP 200 only when the feed:

- Is a public HTTPS URL
- Responds successfully
- Returns an XML content type
- Contains an RSS root
- Contains an RSS channel
- Declares the Google product namespace
- Includes all required fields for every item
- Contains no duplicate `g:id` values

Returns HTTP 503 while the feed is missing, unhealthy, malformed, inaccessible, or incomplete.

### Activation-status API

```text
/api/google-merchant/activation-status
```

Combines:

- Phase 3 catalogue readiness
- Phase 4 feed health

`activationReady` becomes `true` only when both are ready.

## Feed-health safety controls

- Public HTTPS URL validation
- Localhost and internal-host rejection
- 8-second request timeout
- No-store request and response caching
- Five-megabyte monitoring limit
- XML content-type verification
- RSS and Google namespace verification
- Required item-field verification
- Duplicate feed-ID detection
- Secret-free JSON output

## Required Google product item fields

Phase 4 verifies:

```text
g:id
g:title
g:description
g:link
g:image_link
g:availability
g:price
g:condition
```

Phase 2 remains responsible for generating and escaping the complete XML feed.

## Environment configuration

```env
GOOGLE_MERCHANT_ACCOUNT_ID=5615278561
GOOGLE_MERCHANT_DATASOURCE_ID=10681982230
GOOGLE_MERCHANT_FEED_URL=https://superagent-17ea9ea1.base44.app/functions/googleMerchantFeed.xml
```

No secret is required for the hosted-feed activation mode.

## Merchant Center handoff

Do not add the feed URL to Merchant Center until `/api/google-merchant/activation-status` returns:

```json
{
  "activationReady": true
}
```

Then:

1. Keep the existing API data source in place.
2. Add a separate file/URL product source.
3. Paste the verified hosted XML feed URL.
4. Select United States, English, USD, free listings, and Shopping ads as applicable.
5. Trigger the initial fetch.
6. Review Merchant Center diagnostics before enabling paid campaigns.

## Current expected blocker

The current GEM catalogue mainly contains services and digital products. Phase 3 is therefore expected to report zero eligible physical products until real physical inventory, public HTTPS images, and direct checkout URLs are added.

The Phase 4 activation gate should remain closed in that state. This is correct fail-closed behavior.

## Rollback

Revert the Phase 4 commits or close the stacked Phase 4 pull request. Phase 4 introduces no database migration and no credentials.
