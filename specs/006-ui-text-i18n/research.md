# Research: UI Translation Coverage

## Decision 1: Store shared UI translations in bundled JSON locale dictionaries

- **Decision**: Add a top-level `/locales` directory with one JSON dictionary per supported language, beginning with `en.json` and `vi.json`.
- **Rationale**: The requested scope is limited to shared interface text, not editor-managed content. JSON dictionaries keep the system simple, easy to review in version control, and inexpensive to extend as more screens and languages are added.
- **Alternatives considered**:
  - Database-backed UI copy: rejected because the feature explicitly excludes database storage for shared UI text.
  - Inline per-component translation objects: rejected because it scatters wording across the codebase and makes consistency harder to maintain.
  - One file per page: rejected because common labels such as "Create", "Edit", and navigation items benefit from central reuse.

## Decision 2: Resolve UI language from URL first, then saved preference, then English default

- **Decision**: Use the route language prefix as the primary signal for frontend interface language, fall back to a saved user preference when no explicit prefix exists, and default to English otherwise.
- **Rationale**: This matches the feature requirements while keeping language selection predictable. URL-driven language is shareable and visible, while saved preference improves usability for non-prefixed entry points and repeat visits.
- **Alternatives considered**:
  - Saved preference only: rejected because it hides the active language from the URL and weakens link-sharing behavior.
  - Query parameter language selection: rejected because the requested route format is `/en` and `/vi`.
  - Separate hostnames per language: rejected because it expands scope into deployment and domain management.

## Decision 3: Extend the existing i18n helper layer with dictionary loading and `t(key)` resolution

- **Decision**: Build on the existing `src/lib/i18n.ts` language configuration by adding dictionary loading, nested key lookup, and a shared `t(key)` helper that falls back to English when a key is missing in the selected language.
- **Rationale**: The repo already has supported language metadata and route helpers for content i18n. Extending that foundation avoids parallel language systems and gives both content and UI translation features one consistent source of language truth.
- **Alternatives considered**:
  - Introduce a third-party i18n framework: rejected because the requested system is intentionally lightweight and the current Astro codebase can support this behavior directly.
  - Resolve raw dictionary values inside each component: rejected because it would duplicate fallback logic and make missing-key behavior inconsistent.
  - Separate helper modules for frontend and admin: rejected because the translation rules are shared across both experiences.

## Decision 4: Replace hardcoded interface text incrementally with stable translation keys

- **Decision**: Use stable semantic keys for shared UI copy and replace hardcoded strings in navigation, buttons, headings, and common labels across the supported frontend and admin screens.
- **Rationale**: Stable keys allow consistent wording reuse and make dictionary review manageable. Incremental replacement also keeps the rollout safe for a codebase that already contains many literal UI strings.
- **Alternatives considered**:
  - Translate only the most visible screens: rejected because the goal is consistent UI translations across admin and frontend.
  - Auto-generate keys from English labels: rejected because text changes would break key stability and create awkward naming.
  - Translate every visible string in one pass including low-value copy: rejected because the requested scope is clearly bounded to navigation, buttons, labels, and headings.

## Decision 5: Preserve English fallback at the key level instead of failing the whole screen

- **Decision**: If a translation key is missing in the selected language, resolve that key from the English dictionary and continue rendering the page normally.
- **Rationale**: Partial translation coverage is inevitable during rollout and future language expansion. Key-level fallback keeps screens readable and lets teams translate incrementally without producing broken or blank UI.
- **Alternatives considered**:
  - Fail build or request rendering on missing keys: rejected because it would make rollout brittle and block partial progress.
  - Render the key name itself: rejected because it exposes implementation detail to end users.
  - Hide missing UI elements: rejected because it harms usability and creates inconsistent layouts.
