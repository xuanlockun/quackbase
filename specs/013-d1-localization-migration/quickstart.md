# Quickstart: Migration & Runtime Flow

1. **Prepare the D1 table**  
   - Add a migration under `migrations/` that creates the `translation_entries` table with `locale_code`, `translation_key`, `translated_value`, and `updated_at`.  
   - Ensure a unique constraint on `locale_code + translation_key` and indexes on `locale_code` for fast lookups.

2. **Migrate existing JSON data**  
   - Use `scripts/import-localizations.ts` to flatten `locales/<locale>.json`, drop `*Description` keys, and emit the SQL that upserts the remaining strings with the current `updated_at`.  
   - Pipe the generated SQL into `npx wrangler d1 execute <db> --local --file=-` (and repeat with `--remote` for production) to seed `translation_entries`.

3. **Refactor runtime localization loader**  
   - Implement `src/lib/localization.ts` to query `env.DB` for the requested locale (and default locale) while honoring optional namespace filters and caching results for ~30 seconds.  
   - Point `src/middleware.ts` and `src/lib/i18n.ts` at the new payload so `getUiTranslations` reads runtime data instead of static JSON.
   - Add `GET /api/localizations` so other services can request the latest translations plus metadata such as `fallbackUsed` and `lastUpdated`.

4. **Strip verbose payloads**  
   - Ensure any UI layers downstream ignore metadata fields such as `permissionCatalogDescription` so they never appear in responses.  
   - Confirm the runtime translation object maps clean keys (`nav.home`, `messages.noRolesHelp`) to strings only.

5. **Verify and iterate**  
   - Run `npm run dev` or deploy to preview, switch locales, and verify every label/action populates from D1 values.  
   - Update a translation via a D1 client and confirm the UI reflects the change after cache expiration without redeploying.
