# Research: Dynamic Localization Data Migration

## Decision

- **Primary choice**: Host translation entries in Cloudflare D1 with a simple `locale_code` + `translation_key` + `translated_value` schema. Migrate the existing `locales/*.json` bundles into that table while stripping out verbose description-only entries and serve translations directly from workers via a lightweight fetch API.

## Rationale

- Cloudflare D1 is already in use for admin data (posts, languages, roles) and is accessible from the same Cloudflare Workers runtime, so no new infrastructure or build steps are required.
- Moving translations into D1 allows editors or automated scripts to update copy without editing static JSON files or redeploying the site.
- Filtering out description-style entries reduces payload size and keeps the runtime localization payload focused on user-facing copy.
- Serving translations on-demand makes the admin UI more resilient to locale updates and allows caching/invalidation strategies instead of bundling huge JSON files.

## Alternatives Considered

1. **Keep JSON files** but load only the needed keys at runtime: still requires redeploys anytime copy changes and leaves the bulky description fields present, so it fails criterion 9.
2. **Use Cloudflare KV** for translations: KV is globally distributed but not as queryable, and updates do not propagate as quickly inside D1-connected workers without extra logic.
3. **Continue bundling trimmed JSON builds**: introduces another build step to strip metadata and would not allow dynamic updates from administrators.
