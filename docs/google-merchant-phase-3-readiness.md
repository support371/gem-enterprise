# Google Merchant Phase 3 — Operational Readiness

## Scope

Phase 3 adds a non-billing Google Merchant readiness control plane while Codex completes phase 2, the hosted XML feed implementation.

This phase does not call Google Merchant API and does not require:

- Google Cloud billing
- OAuth
- Service-account credentials
- Merchant API registration

## Known connection details

- Merchant Center account ID: `5615278561`
- Existing API data source ID: `10681982230`
- Integration mode: `hosted_xml_feed`
- Expected phase 2 feed URL: `https://superagent-17ea9ea1.base44.app/functions/googleMerchantFeed.xml`

The existing API data source should remain in Merchant Center. It is not used by the billing-independent hosted-feed route.

## Added routes

### Readiness dashboard

`/store/google/readiness`

Displays:

- Complete catalogue count
- Products assigned to the Google storefront
- Eligible physical-product count
- Excluded-product count
- Duplicate IDs and SKUs
- Exclusion reasons
- Merchant account and data-source identifiers
- Expected hosted XML feed URL

### Readiness JSON

`/api/google-merchant/readiness`

Returns a secret-free readiness report for monitoring and agent use.

## Eligibility gate

A product is considered phase-3 ready only when it:

1. Is assigned to the Google storefront.
2. Is explicitly classified as `Physical`.
3. Has a unique product ID and SKU.
4. Has a non-empty title and description.
5. Has a positive finite price.
6. Has a public HTTPS image URL.
7. Has a public HTTPS direct checkout URL.
8. Uses a supported stock status.

Services and digital products remain available on the GEM website but are excluded from the physical-product Google Shopping feed.

## Environment variables

Optional overrides:

```env
GOOGLE_MERCHANT_ACCOUNT_ID=5615278561
GOOGLE_MERCHANT_DATASOURCE_ID=10681982230
GOOGLE_MERCHANT_FEED_URL=https://superagent-17ea9ea1.base44.app/functions/googleMerchantFeed.xml
```

No private credential is required by phase 3.

## Phase 2 dependency

Phase 3 intentionally does not implement or replace the hosted XML feed. Codex phase 2 must deploy the feed endpoint and its XML normalization logic.

After phase 2 is merged:

1. Rebase this branch onto the phase 2 merge commit.
2. Confirm `GOOGLE_MERCHANT_FEED_URL` points to the deployed feed.
3. Run the unit test suite and production build.
4. Open `/store/google/readiness`.
5. Do not add the feed to Merchant Center until at least one physical product is eligible.
6. Add the deployed XML URL as a new file/URL product source in Merchant Center.

## Current catalogue expectation

The existing `storefrontCatalog` is primarily services and digital products. Phase 3 is expected to report zero eligible physical products until real physical inventory with public images and direct checkout links is added. This is a safety result, not a failure.
