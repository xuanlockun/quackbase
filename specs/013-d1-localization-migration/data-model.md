# Data Model: Translation Catalog

## TranslationEntry

- **Purpose**: Stores each localized string so the admin interface and site can request the exact keys they need.
- **Fields**:
  - `locale_code` (text, indexed): ISO locale identifier (`en`, `vi`, etc.).
  - `translation_key` (text): Dot-separated namespace mapping (e.g., `nav.home`, `messages.managePermissions`).
  - `translated_value` (text): User-facing string rendered in the UI.
  - `updated_at` (timestamp): When the translation was last refreshed; helpful for cache invalidation.
- **Constraints**: Unique index on `locale_code + translation_key` to avoid duplicates; updates simply upsert the row.

## LocaleConfiguration

- **Purpose**: Tracks enabled languages and which one is the fallback default.
- **Fields**:
  - `code` (text, primary): Locale code (mirrors `locale_code` in `TranslationEntry`).
  - `display_name` (text): Human-readable label (`English`, `Tiếng Việt`).
  - `enabled` (boolean): Whether admin UI should offer this locale.
  - `is_default` (boolean): Fallback marker when translations are missing.

## LocalizationPayload

- **Purpose**: The aggregated set of `TranslationEntry` rows returned by the runtime loader for a given locale.
- **Composition**: Query D1 for all keys requested by the UI (ideally limited by namespace) and build a plain object mapping `translation_key -> translated_value`.
- **Behavior**:
  - If a key is missing for the requested locale, load from the default locale while logging the gap for analytics/monitoring.
  - Exclude description-style metadata entries (`messages.permissionCatalogDescription`, `messages.headerFooterDescription`, etc.) so runtime payloads stay compact.

## Migration Pipeline (JSON → D1)

- Read each `locales/<locale>.json` file, flatten nested structures into dot-separated keys, and filter out keys where values are documentation-style (e.g., any `...Description` fields identified by spec).
- Insert or upsert each remaining entry into `TranslationEntry` with the current timestamp.
- Seed `LocaleConfiguration` rows if they do not yet exist, preserving which language is currently default.
