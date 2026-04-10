# Research Notes: Language translation management

## Decision: Reuse existing Astro & Cloudflare stack

- **Decision**: Extend the existing Astro admin UI and Cloudflare Workers runtime with a language-specific CRUD page instead of introducing a separate service.
- **Rationale**: The feature must align with the current architecture (Astro 5 + Cloudflare Workers + D1) and reuse the translation_entries table already populated in D1, so adding a dedicated admin route maximizes reuse and keeps deployment complexity low.
- **Alternatives considered**: Spinning up a separate backend API or dashboard was rejected because it would duplicate authentication, require more infra (new cloud functions or server), and diverge from the admin UX that is already in Astro.
