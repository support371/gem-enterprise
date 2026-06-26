# GEM Enterprise GLOBAL-1 Multilingual Integration

## Purpose

This subsystem adds multilingual delivery to the existing GEM Enterprise Next.js application without replacing its authentication, KYC, admin, portal, or public route structure.

The first implementation layer localizes the global website shell and establishes the translation workflow. Page content can be migrated into the same dictionaries incrementally.

## Supported locales

- English (`en`) — source language
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Arabic (`ar`) — right-to-left

## Runtime flow

1. The server reads the `gem-locale` cookie.
2. If the cookie is absent, it checks the browser `Accept-Language` header.
3. English is used as the final fallback.
4. The root layout sets the document `lang` and `dir` attributes.
5. `I18nProvider` supplies the active dictionary to client components.
6. The global navigation and footer read translated labels from that dictionary.
7. The language selector posts a validated locale to `/api/locale` and refreshes the current route.

This approach preserves the existing URLs. It does not insert a locale prefix into protected routes, so authentication redirects and portal links remain stable.

## Files

- `src/i18n/config.ts` — locale list, cookie settings, browser matching, RTL direction
- `src/i18n/server.ts` — request locale resolution
- `src/i18n/get-dictionary.ts` — server dictionary loading with English fallback
- `src/i18n/types.ts` — dictionary types
- `src/i18n/dictionaries/*.json` — locale content
- `src/components/I18nProvider.tsx` — client locale context
- `src/components/LanguageSwitcher.tsx` — accessible locale selector
- `src/components/GlobalNavigation.tsx` — localized mobile-first navigation
- `src/components/GlobalFooter.tsx` — localized footer
- `src/app/api/locale/route.ts` — validated locale preference endpoint
- `scripts/validate-i18n.ts` — parity, direction, JSON, and placeholder checks
- `gt.config.json` — General Translation configuration
- `.github/workflows/i18n-translate.yml` — controlled translation pull-request workflow

## General Translation

Configure these GitHub Actions secrets:

- `GT_PROJECT_ID`
- `GT_API_KEY`

They are server-side credentials and must never use the `NEXT_PUBLIC_` prefix.

To generate translations locally:

```bash
npx gt@latest translate --dry-run
npx gt@latest translate
I18N_STRICT=true pnpm exec tsx scripts/validate-i18n.ts
```

The source dictionary is `src/i18n/dictionaries/en.json`. General Translation writes the configured target dictionaries.

## Translation readiness

Spanish currently contains a translated global-shell seed. French, German, and Arabic include safe scaffolds and English fallback coverage until the General Translation workflow is run and reviewed.

The production workflow uses strict validation. Missing target keys block the production deployment. This prevents incomplete locale packages from silently reaching the production domain.

## Adding page content

Server component example:

```ts
import { getDictionary } from "@/i18n/get-dictionary";
import { getRequestLocale } from "@/i18n/server";

const locale = await getRequestLocale();
const dictionary = await getDictionary(locale);
```

Client component example:

```ts
import { useI18n } from "@/components/I18nProvider";

const { locale, dictionary } = useI18n();
```

Add new English source keys first. Then run the translation workflow, review the generated pull request, validate the preview deployment, and merge only when all required locales are complete.

## Protected content

Do not translate:

- Environment variable names or values
- API route paths
- Database property names
- Code identifiers
- Template placeholders
- Domain names
- GEM Enterprise
- GEM Cybersecurity & Monitoring Assist
- Alliance Trust Realty

## Deployment sequence

1. Update English source strings on a feature branch.
2. Run the `Generate multilingual translations` workflow.
3. Review the generated translation pull request.
4. Confirm strict dictionary validation passes.
5. Confirm lint, tests, and production build pass.
6. Verify the Vercel preview in all supported languages.
7. Verify Arabic direction and mobile menu behavior.
8. Merge only after approval.
9. The main workflow deploys only after validation succeeds.

## Rollback

If the multilingual shell causes a regression:

1. Revert the integration pull request.
2. Keep the source dictionaries and translation branch for diagnosis.
3. Restore the original `Navigation` and `Footer` imports in `src/app/layout.tsx`.
4. Confirm the English production route and protected-route behavior.

The original navigation and footer components remain in the repository as a rollback reference.
