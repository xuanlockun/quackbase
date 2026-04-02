# Implementation Plan: UI Translation Coverage

**Branch**: `006-ui-text-i18n` | **Date**: 2026-04-02 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\spec.md`

## Summary

Add a lightweight UI i18n layer for the Astro site and admin dashboard by introducing locale JSON dictionaries under `/locales`, loading the active dictionary from the language-prefixed route context or saved user preference, exposing a shared `t(key)` helper with English fallback, and replacing hardcoded navigation, button, label, and heading text with translation keys across supported frontend and admin screens.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, existing `src/lib/i18n.ts` language helpers, shared Astro layouts/components, RBAC-driven admin navigation, JSON locale dictionaries loaded from the application bundle  
**Storage**: File-based locale dictionaries in `/locales/*.json`; optional cookie-backed saved language preference for interface language; no database storage for UI copy  
**Testing**: Vitest coverage for language resolution and translation fallback helpers, `npm test`, `npm run check`, plus manual validation across localized frontend and admin routes  
**Target Platform**: Cloudflare Workers serving Astro pages and admin screens in desktop and mobile browsers  
**Project Type**: Server-rendered web application with Astro frontend pages, admin pages, and shared server-side helpers  
**Performance Goals**: Keep locale lookup lightweight enough that page rendering remains effectively unchanged for supported screens, with one dictionary load and key resolution per request context and no visible delay when switching between `/en` and `/vi` routes  
**Constraints**: Create a `/locales` directory with `en.json` and `vi.json`, load UI strings from JSON dictionaries instead of the database, derive language from `/en` and `/vi` URL prefixes when present, support saved preference fallback when URL context is absent, use a shared `t(key)` helper, replace hardcoded UI strings in scope with translation keys, and fall back to English when a translation key is missing  
**Scale/Scope**: Two initial interface languages (`en`, `vi`), one shared translation helper, one locale directory, language-aware frontend and admin navigation, and translation coverage for navigation, primary action buttons, labels, and headings on currently supported screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` is still a template and does not define enforceable project-specific gates.

- Pre-research gate status: PASS, because there are no binding constitution rules to block planning.
- Working checks for this feature:
  - Keep UI i18n scoped to shared interface text and language selection behavior rather than content storage.
  - Reuse the existing Astro route structure and current language utilities where practical instead of introducing a separate translation service.
  - Keep the translation system file-backed and lightweight, with JSON dictionaries bundled in the app.
  - Preserve current admin RBAC flows and existing page behavior while replacing hardcoded text incrementally.
- Post-design gate status: PASS. The planned design stays within the existing Astro application, keeps persistence out of the database, and adds only minimal translation infrastructure.

## Project Structure

### Documentation (this feature)

```text
specs/006-ui-text-i18n/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ui-i18n-contract.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
locales/
|-- en.json
`-- vi.json

src/
|-- components/
|   |-- admin/
|   |   |-- PageForm.astro
|   |   |-- PageTable.astro
|   |   |-- PostForm.astro
|   |   |-- PostTable.astro
|   |   |-- Sidebar.astro
|   |   |-- RoleForm.astro
|   |   |-- RoleTable.astro
|   |   |-- UserForm.astro
|   |   `-- UserTable.astro
|   |-- Footer.astro
|   `-- Header.astro
|-- layouts/
|   |-- AdminLayout.astro
|   `-- BlogPost.astro
|-- lib/
|   |-- i18n.ts
|   `-- [ui translation helper module if split from content helpers]
|-- pages/
|   |-- admin/
|   |   |-- header.astro
|   |   |-- pages.astro
|   |   |-- posts.astro
|   |   |-- roles.astro
|   |   `-- users.astro
|   |-- [lang]/
|   |   |-- [slug].astro
|   |   `-- blog/
|   |       `-- [...slug].astro
|   |-- [slug].astro
|   |-- blog/
|   |   `-- [...slug].astro
|   `-- index.astro
|-- middleware.ts
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- ui-i18n-contract.spec.ts
`-- integration/
    `-- ui-i18n-routes.spec.ts
```

**Structure Decision**: Keep the current single Astro application and add a file-based locale layer in place. Shared language resolution stays close to `src/lib/i18n.ts`, locale dictionaries live at the repository root in `/locales`, and existing frontend/admin pages adopt translation keys without changing the overall route or RBAC architecture.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
