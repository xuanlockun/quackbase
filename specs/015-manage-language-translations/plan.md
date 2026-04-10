# Implementation Plan: Language translation management

**Branch**: `015-manage-language-translations` | **Date**: 2026-04-10 | **Spec**: specs/015-manage-language-translations/spec.md  
**Input**: Feature specification from `/specs/015-manage-language-translations/spec.md`

**Note**: This file follows the `/speckit.plan` workflow. See the companion research/data-model/quickstart/contract docs for the decisions and interfaces that support this plan.

## Summary

Enable administrators to manage translation entries per locale by extending the existing Astro-admin UI and Cloudflare Workers runtime. The plan keeps `/admin/languages` as the master list, adds an Edit action per row, and introduces a dedicated `/admin/languages/[locale]` workspace that loads `translation_entries` scoped to the locale and exposes create/update/delete controls. The research confirmed reusing the current stack is the preferred approach, so the feature glues the new locale-specific view to the existing D1 helpers and RBAC guards.

## Technical Context

**Language/Version**: TypeScript 5.9 running on Node.js 22, compiled by Astro 5 for Cloudflare Workers  
**Primary Dependencies**: Astro 5, `@astrojs/cloudflare`, Cloudflare Workers runtime, Wrangler 4.x, existing shared admin components/styles, `micromark` for rendering rich copy, and `bcryptjs`/JWT helpers for RBAC-signed admin sessions  
**Storage**: Cloudflare D1 (SQLite) for `languages`, `translation_entries`, `posts`, etc.  
**Testing**: `npm test`, `npm run lint`, `npm run dev` (Astro) or `wrangler dev` for manual verification; existing tests focus on admin RBAC and page rendering.  
**Target Platform**: Browser-based admin UI served via Astro pages running on Cloudflare Workers (edge runtime).  
**Project Type**: Web application (single Astro project with built-in admin surface and server-side route handlers).  
**Performance Goals**: Keep admin CRUD flows responsive (<200ms to load/edit/delete entry) so translators can iterate without perceivable lag.  
**Constraints**: Must reuse D1 schema and authentication; avoid spinning up new services or data stores; operate under Cloudflare Workers’ CPU/memory limits.  
**Scale/Scope**: Support dozens of languages and thousands of keys by filtering translation entries by `language_id` and, if needed, paginating/virtualizing the admin table.

## Constitution Check

The constitution file is a placeholder without documented gates, so there are no active governance requirements or violations to clear. We will revisit this section if the constitution is populated later, but no actions are required now.

## Project Structure

### Documentation (this feature)

```text
specs/015-manage-language-translations/
├── plan.md                    # This file (/speckit.plan output)
├── research.md                # Phase 0 research conclusions
├── data-model.md              # Phase 1 data model
├── quickstart.md              # Phase 1 environment notes
├── contracts/
│   └── translation-entries-api.md  # API surface for translation entries
├── checklists/
│   └── requirements.md
```

### Source Code (repository root)

```text
src/
├── components/                # Shared admin widgets, forms, tables
├── layouts/                   # Layouts/shared admin scaffolding
├── lib/                       # D1 helpers (`blog.ts`, `i18n.ts`), auth/RBAC utilities
├── pages/
│   └── admin/
│       ├── languages.astro     # Existing list view
│       ├── pages.astro
│       ├── posts.astro
│       ├── permissions.astro
│       └── ...                 # Other admin sections
└── styles/                     # Global + admin CSS
docs/
scripts/
migrations/
public/
```

**Structure Decision**: Continue working within the single Astro project. The new locale detail page lives under `src/pages/admin/languages`, shares layout/styles with existing admin views, and uses helpers in `src/lib` to query `translation_entries` from D1. No new backend or repository subdivisions are needed.
