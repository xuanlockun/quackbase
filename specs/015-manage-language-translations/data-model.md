# Data Model: Language translation management

## Entity: languages

- **Purpose**: Defines every supported locale that appears on `/admin/languages`.
- **Key fields**:
  - `id` (integer/UUID): Primary key used in RBAC and routing.
  - `code` (string): Locale code such as `en`, `fr`, `es`.
  - `display_name` (string): Human-friendly name (e.g., "French").
  - `direction` (string, optional): Text direction to support future UI tweaks (LTR/RTL).
  - `created_at`, `updated_at`: Timestamps for auditing language additions/changes.
- **Relationships**:
  - One language → many `translation_entries` filtered by `language_id`.

## Entity: translation_entries

- **Purpose**: Stores key/value pairs for localized copy tied to a specific language.
- **Key fields**:
  - `id`: Primary key for the translation entry.
  - `language_id`: Foreign key referencing `languages.id`.
  - `key`: Unique identifier per language (e.g., `nav.home`).
  - `value`: Localized string.
  - `source`: Optional metadata (e.g., "admin" or "import").
  - `context`: Optional description for translators.
  - `created_by`, `updated_by`: Admin user identifiers.
  - `created_at`, `updated_at`: Change tracking timestamps.
- **Validation rules**:
  - (`language_id`, `key`) pair must be unique to prevent duplicate keys.
  - `value` must be non-empty for active entries.
- **State transitions**:
  - Create: Insert row with language_id filter, returns new entry.
  - Update: Modify `value`, `context`, `updated_by`, and `updated_at`.
  - Delete: Remove row from D1, ensuring UI refresh drops the entry.
