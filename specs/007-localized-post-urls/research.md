# Research: Localized Post URLs

## Decision 1: Store post `slug` and `description` as localized JSON alongside other translated post fields

- **Decision**: Persist `slug` and `description` for posts as JSON objects keyed by language code, serialized into D1 `TEXT` columns in the same style as localized `title` and `content`.
- **Rationale**: The feature requires full multilingual post support, including language-specific slugs and descriptions. Keeping all translatable post fields in the same JSON-backed pattern minimizes schema complexity, fits the existing D1 helper approach, and keeps future language expansion straightforward.
- **Alternatives considered**:
  - Separate translation table for slugs and descriptions: rejected because it adds joins and coordination overhead to a feature explicitly scoped as lightweight.
  - Keep one canonical slug plus localized display metadata: rejected because the requirement calls for language-specific slugs in the URL itself.
  - Add one slug column per language: rejected because it scales poorly as new languages are added.

## Decision 2: Resolve posts from a dedicated clean route shape at `/{lang}/{slug}`

- **Decision**: Serve post detail pages from a language-prefixed clean route using `src/pages/[lang]/[slug].astro`, where the slug is matched against the slug translation for the requested language.
- **Rationale**: The requested URL structure removes the `/blog` prefix and makes the language and localized slug the only path components. This is SEO-friendly, shareable, and aligned with Astro's file-based routing model.
- **Alternatives considered**:
  - Keep `/blog/{slug}` and add a language prefix only: rejected because it does not satisfy the clean URL requirement.
  - Use query parameters for language selection: rejected because it weakens URL clarity and does not match the requested route format.
  - Use a catch-all route for all content types: rejected because posts already have distinct resolution rules and would become harder to disambiguate from localized pages.

## Decision 3: Apply field-level fallback for translated values, but not cross-post slug guessing

- **Decision**: When a post is resolved, any missing translated `title`, `description`, or `content` value falls back to English. For slug matching, the system first tries the requested language slug, then may use the default-language slug for the same post only when the requested language lacks its own slug mapping and the request uses that default slug under the language path.
- **Rationale**: Visitors should still be able to read posts with incomplete translations, but slug matching must remain deterministic and must not accidentally map one post to another. Restricting slug fallback to the current post’s default slug avoids ambiguous routing while still allowing rollout with partial localized slugs.
- **Alternatives considered**:
  - No slug fallback at all: rejected because partially translated posts would become inaccessible in secondary-language paths during rollout.
  - Global fuzzy slug fallback across all posts: rejected because it risks collisions and incorrect resolution.
  - Force every language slug to exist before publishing: rejected because it conflicts with the requested fallback model and slows editorial adoption.

## Decision 4: Generate per-language slugs in the admin form from each language’s title

- **Decision**: Extend the admin post form to edit slugs per language and provide per-language auto-generation from the corresponding localized title field, while still allowing manual override.
- **Rationale**: Editors need direct control over SEO-friendly slugs, especially when languages transliterate differently. Auto-generation from the localized title reduces manual work and keeps the editing workflow aligned with existing multilingual post authoring.
- **Alternatives considered**:
  - Single shared slug generator from English only: rejected because it produces poor localized URLs for Vietnamese and future languages.
  - Manual slug entry only: rejected because it increases repetitive editorial work and makes inconsistent slugs more likely.
  - Server-only slug generation with no admin visibility: rejected because editors need to review and adjust URLs intentionally.

## Decision 5: Migrate existing scalar slugs into default-language JSON and preserve legacy reachability during rollout

- **Decision**: Introduce a migration that wraps existing scalar `slug` values into JSON using the default language key and does the same normalization for legacy scalar descriptions where needed, while updating application reads to tolerate both migrated and already-localized rows during deployment.
- **Rationale**: Existing posts must remain publishable and readable after the schema change. Converting historical scalar values into localized JSON maintains content continuity and keeps the system internally consistent going forward.
- **Alternatives considered**:
  - Require manual re-entry of slugs for all existing posts: rejected because it creates unnecessary migration risk and editorial burden.
  - Hard cutover with no compatibility handling: rejected because it risks breaking published URLs during deployment.
  - Keep mixed scalar/JSON behavior permanently: rejected because it would complicate helper logic and make validation inconsistent.
