# Data Model: Localized Post URLs

## Supported Language

**Purpose**: Defines the set of languages available for localized post authoring and post URL resolution, beginning with English and Vietnamese.

**Fields**

- `code`: Stable language code such as `en` or `vi`.
- `label`: Human-readable language name shown in the admin UI.
- `isDefault`: Indicates the fallback language used when a translation is missing.
- `isEnabled`: Indicates whether the language is available for authoring and routing.

**Validation Rules**

- Exactly one enabled language is marked as the default.
- English (`en`) is the default language in the initial rollout.
- Vietnamese (`vi`) is enabled in the initial rollout.
- Additional languages must use unique codes.

**Relationships**

- Referenced by all localized post field maps.

## Localized Text Map

**Purpose**: Represents a translatable string field as a JSON object keyed by language code.

**Fields**

- `en`: Default-language value.
- `vi`: Optional Vietnamese value.
- `{futureLanguageCode}`: Optional values for future supported languages.

**Validation Rules**

- Persisted as valid JSON when stored in D1 text columns.
- Keys use supported language codes only.
- Required translatable fields must include an English value.
- Empty strings do not count as completed translations.

**Relationships**

- Embedded within `posts.title`, `posts.description`, and `posts.content`.

## Localized Slug Map

**Purpose**: Represents the language-specific URL slug for a post.

**Fields**

- `en`: Default-language slug.
- `vi`: Optional Vietnamese slug.
- `{futureLanguageCode}`: Optional slug for future supported languages.

**Validation Rules**

- Persisted as valid JSON when stored in the `posts.slug` text column.
- English slug is required for every post.
- Slug values must be normalized into URL-safe form before persistence.
- Empty slug values are invalid.
- A slug must be unique within its language across published posts.
- The same post may use different slug values in different languages.

**Relationships**

- Used by route resolution for localized post detail pages.
- Edited in the admin post form, typically generated from the corresponding localized title.

## Localized Post

**Purpose**: Stores blog content with language-specific URL slug, title, description, and body plus shared publication metadata.

**Fields**

- `id`: Integer primary key.
- `slug`: `Localized Slug Map` stored as a JSON string in a `TEXT` column.
- `title`: `Localized Text Map` stored as a JSON string in a `TEXT` column.
- `description`: `Localized Text Map` stored as a JSON string in a `TEXT` column.
- `content`: `Localized Text Map` stored as a JSON string in a `TEXT` column.
- `heroImage`: Optional image URL.
- `status`: Draft or published state.
- `pubDate`: Publish timestamp.
- `updatedDate`: Last update timestamp.

**Validation Rules**

- `slug.en`, `title.en`, `description.en`, and `content.en` are required for published posts.
- Draft posts may temporarily omit some non-default translations, but must still retain valid English values for required fields.
- Missing non-default `title`, `description`, or `content` values resolve through English fallback on read.
- Missing non-default slug values may fall back to the post’s English slug for routing only when that post has no slug for the requested language.
- Historical scalar slug rows must be migratable into `{"en":"existing-slug"}` form without changing which post they identify.

**Relationships**

- Rendered by localized public post routes.
- Edited through the admin post create and edit workflow.

## Post Route Resolution Context

**Purpose**: Captures the requested language and slug used to resolve a post detail page.

**Fields**

- `requestedLanguage`: Language code derived from the first path segment.
- `requestedSlug`: Slug derived from the second path segment.
- `matchedLanguage`: Language variant whose slug matched the request.
- `resolvedPostId`: The post selected by slug matching.
- `fallbackLanguage`: Default language code, initially `en`.

**Validation Rules**

- `requestedLanguage` must be a supported language or the request is rejected by routing.
- `requestedSlug` must match a current slug for the requested language, or a valid fallback slug for the same post, before a post is returned.
- Resolution must not map a request to a different post through loose matching.

**Relationships**

- Uses `Localized Slug Map` values to identify a `Localized Post`.
- Feeds language-aware rendering and canonical link generation.

## State Transitions

### Post Save Lifecycle

1. Admin opens the create or edit post form.
2. Admin selects a language and edits localized title, slug, description, and content values.
3. Admin may auto-generate the slug for the active language from that language’s title, then manually adjust it if needed.
4. System validates English requirements and uniqueness of every provided language-specific slug.
5. System serializes localized field maps into JSON strings and persists the post.

### Post Migration Lifecycle

1. Migration reads existing scalar `slug` values from historical post rows.
2. System wraps each legacy slug into a localized slug map under the English key.
3. System normalizes any legacy non-localized descriptions into English-keyed JSON if needed.
4. Application helpers treat migrated records as the canonical shape going forward.

### Public Read Lifecycle

1. Visitor requests a route such as `/en/dog` or `/vi/con-cho`.
2. System resolves the requested language from the first path segment and the requested slug from the second path segment.
3. Content helpers look up the published post by matching the slug for that language.
4. If the post lacks a slug for the requested language, the helper may resolve the same post by its default-language slug under the requested language path.
5. After the post is found, the system resolves title, description, and content for the requested language with English fallback for missing fields.
6. The localized post page renders with the resolved values or returns not found if no valid post match exists.
