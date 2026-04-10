# Localization management

Edge CMS now stores every UI translation string in the Cloudflare D1 `translation_entries` table instead of bundling them in static JSON files. Each row maps a `locale_code` (e.g., `en`, `vi`) to a `translation_key` like `nav.home` and its `translated_value`.

## Data cleanup & import

1. Run `node scripts/import-localizations.ts` to flatten `locales/<code>.json`, drop verbose keys ending with `Description` (such as `messages.permissionCatalogDescription`), and emit a SQL batch that upserts the remaining strings into D1.
2. Pipe the generated SQL into `npx wrangler d1 execute <database-name> --local --file=-` (replace `<database-name>` with the entry from `wrangler.json`). Repeat with `--remote` when pushing to production.
3. The script stores timestamps in `updated_at`, which drives cache invalidation when labels change.

## Runtime behavior

- Middleware reads `locals.uiLanguage` and the current language catalog, then calls `src/lib/localization.ts` to pull translations for the requested locale plus the default fallback locale.
- The localization helper exposes `translations`, `fallbackTranslations`, `lastUpdated`, and a `fallbackUsed` flag to the UI, so `src/lib/i18n.ts` can always fall back to default strings when a locale is still missing a key.
- API consumers (e.g., `GET /api/localizations`) can request a subset via the `namespace` query parameter to keep payloads small. The service caches each locale/namespace pair for ~30 seconds but exposes `lastUpdated` so clients can invalidate stale copies.

## Updating translations in production

1. Edit the JSON files under `locales/` or update the D1 rows manually.
2. Re-run `node scripts/import-localizations.ts` with `--apply` to push the cleaned translations into D1.
3. After the TTL expires (30 seconds by default) or after you manually call `invalidateLocalizationCache()` (used by the import script), the UI fetches the new copy without redeploying the site.
