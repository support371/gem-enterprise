# GEM Command Center Aggregate Exports

## Endpoint

`GET /api/command-center/export?format=csv`

`GET /api/command-center/export?format=json`

Both formats require the same active staff authorization used by the live command-center snapshot. Client accounts and unauthenticated requests cannot export cross-organization aggregates.

## Data included

The export contains aggregate command-center values only:

- active user count;
- distinct organization count;
- active product count;
- active entitlement count;
- open support-ticket count;
- open service-request count;
- audit-event count for the previous 24 hours;
- persistent operating-layer metrics when the approved tables are installed;
- operating-layer readiness status when the approved tables are not installed.

The CSV columns are:

| Column | Meaning |
| --- | --- |
| `section` | `platform` or `operating_layer` |
| `metric` | Human-readable aggregate metric |
| `value` | Numeric value or a fixed readiness message |
| `source` | `database`, `migration_required`, or `unavailable` |
| `generated_at` | UTC snapshot generation time |

## Data excluded

Exports do not contain:

- names;
- email addresses;
- phone numbers;
- identity documents;
- passwords;
- API secrets;
- OAuth access or refresh tokens;
- payment-card information;
- bank-account information;
- individual client transactions or financial positions.

## Response controls

- Responses use `Cache-Control: no-store, max-age=0`.
- Responses use `Content-Disposition: attachment` with a generated UTC filename.
- CSV responses use UTF-8 with a byte-order mark for spreadsheet compatibility.
- CSV cells are quoted and embedded quotes are escaped.
- Unsupported formats return HTTP 400.
- Export generation reuses the same snapshot service as the dashboard to prevent data-contract drift.

## Example filenames

`gem-command-center-2026-07-13T01-45-30-123Z.csv`

`gem-command-center-2026-07-13T01-45-30-123Z.json`

## Operational limits

The export endpoint is intended for staff review, evidence preparation, and internal reporting. It does not create scheduled reports, send email, upload files to external services, or trigger billing. Those actions require separate audited workflows and explicit approval.
