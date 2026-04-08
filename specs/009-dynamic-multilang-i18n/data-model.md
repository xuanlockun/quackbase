# Data Model: Dynamic Multi-Language System

## Entity: `languages`

| Field | Type | Constraints | Notes |
|-------|------|---------------|--------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Surrogate key |
| `code` | TEXT | NOT NULL, UNIQUE | Stable URL segment and JSON key (e.g. `en`, `vi`, `zh-Hans` if URL-safe policy allows) |
| `name` | TEXT | NOT NULL | Display name in the language switch and admin lists |
| `enabled` | INTEGER/boolean | NOT NULL, default 1 | 0 = disabled for public switch and new selections per spec |
| `is_default` | INTEGER/boolean | NOT NULL, default 0 | Exactly one row should have `is_default = 1` among enabled catalog |

**Relationships**:

- Referenced by post/page JSON keys in `title`, `slug`, `description`, `content` (string keys matching `code`).

**Rules**:

- **R1**: At most one language has `is_default = 1` (enforce in transaction on insert/update/set default).
- **R2**: `code` immutable or rename-only with data migration (document in implementation).
- **R3**: Disabling a language does not delete JSON keys in existing posts; fallback rules apply at read time.

---

## Entity: `posts` (relevant columns)

| Field | Type | Notes |
|-------|------|--------|
| `slug` | TEXT (JSON object) | Map `code` → slug string per locale |
| `title` | TEXT (JSON object) | Map `code` → title |
| `description` | TEXT (JSON object) | Map `code` → description |
| `content` | TEXT (JSON object) | Existing localized body; fallback same as other fields |

**Validation (logical)**:

- Keys in JSON should be valid language codes present in `languages` at save time (warn or strip unknown keys per product policy).
- Slug uniqueness for published posts remains per existing `assertPublishedPostSlugUniqueness` behavior, extended to dynamic default language code.

---

## State transitions: language

```
[ created ] → enabled/disabled toggled by admin
[ is_default ] → only one; setting new default clears previous
```

---

## Indexes

- `languages`: UNIQUE(`code`); optional index on `enabled` for listing enabled rows.

---

## Seed / migration notes

- Initial migration should insert rows equivalent to current `SUPPORTED_LANGUAGES` (e.g. `en`, `vi`) with one `is_default = 1` to avoid breaking existing JSON keyed by `en`.
