# GEM Enterprise Search Console Baseline

**Verified:** 2026-09-13  
**Source:** connected Google Search Console domain property `sc-domain:gemcybersecurityassist.com`  
**Measurement window:** 2026-06-13 through 2026-09-11  
**Search type:** Web

This file records measured acquisition evidence. It does not change GEM's claims registry or imply a conversion where downstream analytics are not yet connected.

## Property summary

- Clicks: **9**
- Impressions: **2,157**
- CTR: **~0.42%**
- Average position: **~12.1**

Interpretation: GEM has an indexed visibility foundation, but organic search is not yet operating as a mature customer-acquisition channel. Current demand is primarily branded/navigation-oriented, with very limited verified buyer-intent traffic.

## Query observations

| Query | Clicks | Impressions | Avg. position | Operating interpretation |
|---|---:|---:|---:|---|
| `gem enterprise` | 0 | 71 | ~5.4 | Strong branded visibility but no measured click capture in this period |
| `gem cyber security` | 0 | 24 | ~16.7 | Relevant brand/category association but weak page-one visibility |
| `gementerprise` | 1 | 15 | ~6.7 | Branded navigation traffic |
| `cyber gem` | 0 | 15 | ~8.6 | Ambiguous/brand-adjacent query with visibility but no measured click |
| `gem portal cyber` | 0 | 12 | ~5.8 | Portal/navigation intent rather than a service-buying query |

Low-volume buyer-intent phrases such as security-posture assessment/service variants were observed, but not at enough volume/position to treat them as a proven acquisition engine yet.

## Page observations

| Page | Clicks | Impressions | Avg. position | Operating interpretation |
|---|---:|---:|---:|---|
| `/` | 8 | 800 | ~8.2 | Main organic click surface; must route qualified visitors clearly to current bounded offers |
| `/hub` | 1 | 285 | ~10.1 | Has visibility; optimize only where it supports commercial/user intent |
| `/company` | 0 | 279 | ~9.6 | Trust/brand visibility without measured click capture |
| `/get-started` | 0 | 288 | ~9.5 | Search visibility but no measured click conversion from results |
| `/services` | 0 | 180 | ~13.2 | Important commercial surface with weak organic click capture |
| `/request-access` | 0 | 78 | ~13.5 | Qualification surface is indexed but not currently a search-acquisition destination |
| `/store/main` | 0 | 316 | ~18.3 | Large impression share relative to commercial relevance; should not displace the bounded service funnel |
| `/resources` | 1 | 175 | ~11.8 | Discovery visibility; claims must remain evidence-controlled before distribution is scaled |

The newly launched `/business-review` page did not appear among the principal 90-day page rows retrieved in this measurement pass. Treat it as the current buyer-intent acquisition experiment and instrument it prospectively rather than inventing historical performance.

## Conversion-measurement limitation

No GA4 property was connected through the Search Console analytics connector during this verification pass. Therefore Search Console can establish query/page acquisition evidence, but it cannot by itself verify the complete journey:

`search → business-review view → request start → intake submit → qualified → proposal → payment → onboarding → delivery → expansion`

Use `src/lib/analytics/commercialEvents.ts` as the canonical event contract when an approved analytics provider is connected/instrumented.

## Immediate SEO/commercial priorities

1. Make `/business-review` the primary measurable buyer-intent landing experiment for the $199 bounded review.
2. Improve `/services` search snippet/title/message alignment around the specific problems GEM can evidence and deliver, rather than broad generic cybersecurity language.
3. Improve branded-query click capture for `gem enterprise` while keeping the canonical company identity and claims-controlled wording.
4. Use `/resources` to support education/internal linking into bounded service pages, but reconcile high-risk claims before amplifying traffic.
5. Do not treat `/store/main` impressions as proof of service demand or commerce readiness.
6. Connect/instrument one downstream analytics provider against the canonical commercial event contract before optimizing for conversion rates.

## Evidence handling

- These values are a dated Search Console snapshot and will change over time.
- Do not turn search impressions into customer, revenue, demand, or conversion claims.
- Re-run the property/query/page report before publishing any future performance statistic.
