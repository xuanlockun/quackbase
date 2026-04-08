# Research: Dynamic Multi-Language System (009)

## 1. Source of truth for enabled languages and labels

**Decision**: Store the catalog in D1 table `languages` (`code`, `name`, `enabled`, `is_default`). Load enabled rows for the language switch and route validation; derive the default language from the row where `is_default` is true.

**Rationale**: Matches the feature spec and user input; removes hardcoded `SUPPORTED_LANGUAGES` in `src/lib/i18n.ts`; single place for admin CRUD.

**Alternatives considered**:

- **KV cache only**: Faster but duplicates truth and complicates invalidation; defer until profiling shows need.
- **Config file**: Does not satisfy “admin can create/enable/disable without deploy.”

---

## 2. Default language for fallback and validation

**Decision**: Treat the database default (`is_default = 1`) as the canonical default for `resolveLocalizedValue`, slug fallback, and “missing key” behavior. Migrate existing JSON that assumed `"en"` so keys align with catalog codes after seeding.

**Rationale**: Spec requires exactly one default and fallback to default when a translation is missing; hardcoded `DEFAULT_LANGUAGE = "en"` must be replaced or scoped to “initial seed only.”

**Alternatives considered**:

- **Keep `en` as code always**: Rejected if admins use another default code; DB must drive behavior.

---

## 3. Invalid or disabled `lang` in public URL

**Decision**: If the first segment is not an enabled language `code`, respond with **301/302** to the same path under the current default language code when a resource can still be identified; if the slug does not exist, **404** as today. Do not render a page with a fake language context.

**Rationale**: Aligns with `spec.md` FR-010 and assumptions (controlled outcome, no wrong locale).

**Alternatives considered**:

- **404 for bad lang**: Stricter but worse UX for old bookmarks; redirect is spec-preferred.

---

## 4. Ordering of languages in the switch

**Decision**: Order enabled languages by `name` ascending (case-insensitive) for deterministic FR-008 behavior, using only the columns the user specified.

**Rationale**: No `sort_order` column in the requested schema.

**Alternatives considered**:

- **Add `sort_order` later**: Optional follow-up if editorial teams need manual ordering.

---

## 5. UI chrome strings vs content language

**Decision**: Interface strings (buttons, errors) remain **file-based** locale JSON (`locales/*.json`) and existing UI language cookie behavior where applicable; **language switch options** use `languages.name` from D1. Content fields (posts) use JSON maps keyed by `code`.

**Rationale**: Spec 006 already separates UI i18n from content; this feature focuses on catalog + content + routing; loading all UI strings from DB is out of scope unless spec is extended.

**Alternatives considered**:

- **Full DB UI strings**: Large scope; not required for “dynamic list” for the switch.

---

## 6. Posts shape

**Decision**: Keep `title`, `slug`, `description` as JSON text maps (already true in schema); `content` remains JSON per existing migrations—no change to column types, only key validation against known or catalog codes as implemented.

**Rationale**: User called out title/slug/description; codebase already stores localized `content` as JSON.

---

## Open items resolved for implementation

| Topic | Resolution |
|--------|---------------|
| `isLanguageCode` regex vs BCP-47 | Keep pragmatic validation; catalog `code` is admin-defined but should remain URL-safe (document in validation). |
| Admin API shape | REST JSON under `/api/admin/...` with existing RBAC patterns (see contracts). |
