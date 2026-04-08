# Quickstart: 009 Dynamic Multi-Language System

## Prerequisites

- Node.js 22+
- Wrangler / Cloudflare D1 configured like the rest of this repo

## Apply schema

1. Add a new SQL migration under `migrations/` that creates `languages` and seeds initial rows (see `data-model.md`).
2. Run the project’s usual D1 apply flow (e.g. `wrangler d1 migrations apply` for the target database — use the same commands documented for existing migrations in this repo).

## Verify catalog

1. Open admin language management (once implemented) or query D1: enabled rows should match what the public switch shows.
2. Confirm exactly one row has `is_default = 1`.

## Verify public routing

1. Visit `/{enabledCode}/{slug}/` for a published post with translations in that language.
2. Visit with a **disabled** or unknown first segment: expect redirect to default-language URL or 404 when the slug is missing (per `research.md`).
3. Toggle a translation off for a non-default language: field should show default language text.

## Verify language switch

1. Add a new language in admin; reload public and admin pages: dropdown should list it without code changes.
2. Disable a language: it should disappear from public switch per policy.

## Tests

- Run `npm test` and `npm run lint` from the repository root after implementation.
