# Research Findings: Language Management System

## Language metadata in D1

- **Decision**: Store every language (code, name, enabled, is_default) in the Cloudflare D1 `languages` table so both the admin UI and client routing share the same dataset.
- **Rationale**: The requirements demand admin control, dropdown consistency, and dynamic routes; a centralized table ensures the admin list, dropdown, and router reference a single source of truth.
- **Alternatives considered**: Keeping languages in config files (fails admin control) or duplicating data per runtime (leads to inconsistencies and duplicate prefixes).

## Shared dropdown and fallback

- **Decision**: Build a reusable dropdown component that fetches enabled languages from the database, highlights the current language, and relies on fallback logic that redirects missing codes/translations to the default language.
- **Rationale**: A single component delivered to admin and client ensures UI consistency and adheres to the "no duplicate prefix" constraint by having switchLang cleanly replace the existing prefix before navigating.
- **Alternatives considered**: Separate UI components or client-side arrays of languages; both risk divergence and violate the requirement that the routing list reflects runtime languages.
