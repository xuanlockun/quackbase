# Research: Multilingual Content Support

## Decision 1: Store localized `title` and `content` values as JSON strings in existing D1 text columns

- **Decision**: Persist `title` and `content` for `posts` and `site_pages` as JSON objects keyed by language code, serialized into `TEXT` columns in Cloudflare D1.
- **Rationale**: The requested scope is intentionally lightweight, and the current project already reads and writes posts and pages through centralized helpers in `src/lib/blog.ts`. JSON-backed text columns preserve a simple schema, allow future language expansion without adding join tables, and fit SQLite/D1 well for small multilingual payloads.
- **Alternatives considered**:
  - Separate translation tables per entity: rejected because they add relational complexity, joins, and migration overhead that the requested lightweight system does not need.
  - Add one column per language: rejected because it does not scale cleanly as more languages are added later.
  - Store raw JSON end to end without helper normalization: rejected because the application still needs predictable parsing, fallback handling, and migration of English-only historical records.

## Decision 2: Keep language selection in the URL using a dedicated first path segment

- **Decision**: Introduce language-prefixed public routes such as `/en/{pageSlug}` and `/vi/blog/{postSlug}` and resolve the active language from that first URL segment.
- **Rationale**: The user explicitly requested language selection from the URL. A path segment is easy to cache, easy to link, and keeps the selected language visible and shareable without relying on cookies or query parameters. It also fits Astro's file-based routing model cleanly.
- **Alternatives considered**:
  - Query parameter selection like `?lang=vi`: rejected because it does not meet the requested `/en/` and `/vi/` URL form.
  - Cookie-only language state: rejected because it hides the selected language from the URL and makes direct linking less predictable.
  - Domain or subdomain per language: rejected because it would expand scope into deployment and host configuration.

## Decision 3: Normalize translations in shared helpers and apply field-level English fallback on read

- **Decision**: Add shared translation parsing helpers that convert JSON strings into normalized translation maps and resolve the display value for a requested language with English fallback for each translatable field independently.
- **Rationale**: Existing records are English-only, and future records may have partial translations. Resolving fallback at the helper layer keeps frontend pages and admin APIs consistent while preventing blank `title` or `content` output when a specific translation is absent.
- **Alternatives considered**:
  - Require every supported language for every save: rejected because it slows editorial rollout and conflicts with the fallback requirement.
  - Apply fallback only in the page components: rejected because API consumers and admin detail views would still need duplicate logic.
  - Treat a record as untranslated unless all localized fields exist: rejected because partial progress should remain usable and readable.

## Decision 4: Extend existing admin forms with a reusable language switcher and JSON-aware submission shape

- **Decision**: Reuse the current dedicated post and page forms while adding a shared multilingual editing pattern, either through tabs or grouped inputs, that edits `title` and `content` per language and submits them as JSON payloads.
- **Rationale**: The current admin UI already uses dedicated create/edit pages for posts and pages, so multilingual editing can stay within that established workflow. A shared language editor keeps the admin experience consistent and reduces duplication across `PostForm.astro` and `PageForm.astro`.
- **Alternatives considered**:
  - Separate create/edit screens per language: rejected because it fragments one content record into multiple workflows.
  - One large stacked form with no language switcher: rejected because it becomes harder to scan as more languages are added.
  - A client-only editor with independent API calls per language: rejected because current forms already submit through server-handled endpoints and do not need that added complexity.

## Decision 5: Accept translation objects in admin APIs and return parsed translation objects to the frontend/admin consumers

- **Decision**: Update the admin post/page APIs so write handlers accept translation objects for translatable fields, while read handlers return parsed translation objects plus language-resolved display values where the UI needs them.
- **Rationale**: The user explicitly requested JSON acceptance on write and parsed JSON responses on read. Returning structured translation objects from API boundaries keeps admin editing and future clients from re-parsing raw JSON strings themselves.
- **Alternatives considered**:
  - Continue using form-only scalar fields and synthesize JSON server-side: rejected because the admin UI now needs to represent multiple languages explicitly.
  - Return raw JSON strings from read APIs: rejected because it pushes parsing responsibility outward and increases duplication.
  - Create separate translation-specific endpoints: rejected because the current app already has stable post/page endpoints that can evolve in place.
