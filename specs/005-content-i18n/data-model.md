# Data Model: Multilingual Content Support

## Supported Language

**Purpose**: Defines which language codes are available for authoring and public rendering, beginning with English and Vietnamese.

**Fields**

- `code`: Stable language code such as `en` or `vi`.
- `label`: Human-readable language name shown in the admin UI and language switchers.
- `isDefault`: Boolean-like indicator for the fallback language.
- `isEnabled`: Boolean-like indicator controlling whether the language appears in authoring and public URLs.

**Validation Rules**

- Exactly one enabled language is marked as the default.
- English (`en`) is the default language in the initial release.
- Vietnamese (`vi`) is enabled in the initial release.
- Additional languages must use unique codes.

**Relationships**

- Referenced by localized post and page field maps.

## Localized Text Map

**Purpose**: Represents a translatable string field as a JSON object keyed by language code.

**Fields**

- `en`: Default-language string value.
- `vi`: Optional Vietnamese string value.
- `{futureLanguageCode}`: Optional string values for additional supported languages.

**Validation Rules**

- Stored as valid JSON when persisted in D1 `TEXT` columns.
- Keys use supported language codes only.
- English must be present for required translatable fields.
- Empty strings should not be treated as valid completed translations.

**Relationships**

- Embedded within `posts.title`, `posts.content`, `site_pages.title`, and `site_pages.content`.

## Multilingual Post

**Purpose**: Stores blog content with localized title and content plus existing post metadata.

**Fields**

- `id`: Integer primary key.
- `slug`: Unique stable post slug shared across all languages.
- `title`: `Localized Text Map` stored as JSON string in a `TEXT` column.
- `description`: Existing non-translatable summary string retained as-is unless a later feature expands scope.
- `content`: `Localized Text Map` stored as JSON string in a `TEXT` column.
- `heroImage`: Optional image URL.
- `status`: Draft or published state.
- `pubDate`: Publish timestamp.
- `updatedDate`: Last update timestamp.

**Validation Rules**

- `slug` remains unique and language-independent.
- `title.en` is required.
- `content.en` is required.
- Missing secondary-language values are allowed and resolved through English fallback on read.
- Historical English-only records must be migratable into JSON-backed fields without changing semantic content.

**Relationships**

- Rendered by localized blog routes.
- Edited through the admin posts create/edit workflow.

## Multilingual Page

**Purpose**: Stores custom site pages with localized title and content plus existing page metadata and section configuration.

**Fields**

- `id`: Integer primary key.
- `slug`: Unique stable page slug shared across all languages.
- `title`: `Localized Text Map` stored as JSON string in a `TEXT` column.
- `description`: Existing non-translatable page summary retained as-is unless expanded later.
- `content`: `Localized Text Map` stored as JSON string in a `TEXT` column.
- `showPostsSection`: Existing derived flag for legacy page section behavior.
- `pageSections`: Existing JSON-backed page section configuration.
- `status`: Draft or published state.
- `updatedAt`: Last update timestamp.

**Validation Rules**

- `slug` remains unique and language-independent.
- `title.en` is required.
- `content.en` is required.
- `pageSections` behavior remains unchanged by the multilingual feature.
- Existing page rows with scalar English content must remain valid after migration.

**Relationships**

- Rendered by localized page routes.
- Edited through the admin pages create/edit workflow.

## Language Selection Context

**Purpose**: Captures the active language used to choose which localized field value to display or edit.

**Fields**

- `requestedLanguage`: Language code derived from the current URL or selected in the admin editor.
- `resolvedLanguage`: Language code actually used after fallback logic.
- `fallbackLanguage`: Default language code, initially `en`.

**Validation Rules**

- `requestedLanguage` must be an enabled language or be rejected by routing/validation.
- `resolvedLanguage` equals `requestedLanguage` when the translation exists.
- `resolvedLanguage` falls back to `en` when the requested translation is missing.

**Relationships**

- Drives frontend rendering of posts and pages.
- Drives which localized fields appear in the admin form editor.

## State Transitions

### Post Or Page Save Lifecycle

1. Admin opens a create or edit form.
2. Admin selects a language tab or input group.
3. Admin enters localized `title` and `content` values.
4. System validates required English values and any provided secondary-language values.
5. System serializes the localized field maps into JSON strings.
6. D1 persists the record while leaving non-translatable fields unchanged.

### Public Read Lifecycle

1. Visitor requests a localized URL such as `/en/{slug}` or `/vi/blog/{slug}`.
2. System resolves the language code from the URL.
3. Content helpers load the post or page from D1 and parse localized JSON fields.
4. System resolves `title` and `content` for the requested language.
5. If either localized value is missing, the system falls back to English for that field.
6. The localized page renders with the resolved values.

### Future Language Enablement

1. Product owner enables a new supported language.
2. Admin forms include the new language in the language selector.
3. Existing content continues to resolve through English fallback until the new localized fields are added.
