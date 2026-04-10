# Implementation Plan: Dynamic Localization Data Migration

**Branch**: `013-d1-localization-migration` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/013-d1-localization-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the static `locales/*.json` bundles with a Cloudflare D1-backed localization store, migrate the existing translations (excluding unnecessary descriptive metadata), and refactor the admin/runtime fetch path to load only the keys it renders so locale switches remain fast while allowing copy updates without redeploys.

## Technical Context

**Language/Version**: TypeScript 5.9 running in Astro 5 with Node.js 22 on Cloudflare Workers  
**Primary Dependencies**: `astro`, `@astrojs/cloudflare`, Wrangler 4.x, Cloudflare Workers runtime, Cloudflare D1, shared admin components, existing RBAC/auth helpers, and `micromark` for markdown rendering  
**Storage**: Cloudflare D1 (SQLite) currently backing posts, pages, languages, users, roles, and now translations  
**Testing**: `npm test`, `npm run lint`, plus `npm run dev`/deployed worker manual verification of locale renders  
**Target Platform**: Cloudflare Workers + Astro 5 edge runtime  
**Project Type**: Web application (admin dashboard + marketing site)  
**Performance Goals**: Locale payload fetches should respond within 500 ms and reduce translation payload size by at least 30 % compared to today’s JSON files  
**Constraints**: No separate build/deploy pipeline, keep runnable in current Worker environment, D1 row count and query limits, dynamic fetch must remain cacheable yet invalidatable  
**Scale/Scope**: Two supported locales today (en, vi) with expansion to more languages; translation catalog is a few hundred keys scoped to admin UI labels, actions, hints, and messages

## Constitution Check

*GATE: No constitution gates are enforceable because `.specify/memory/constitution.md` currently contains placeholder text; proceed with the plan normally.*

## Project Structure

### Documentation (this feature)

```text
specs/013-d1-localization-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── localization-api.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── components/        # Admin and site UI atoms, grids, forms
├── layouts/           # Astro layout shells for admin & public pages
├── lib/               # Helpers (translations, auth, RBAC, data access)
├── pages/             # Astro routes for admin dashboards and blog pages
├── styles/            # Shared CSS/SCSS assets
├── middleware.ts
├── consts.ts
├── env.d.ts
└── (existing translation helpers that will be refactored)

locales/               # Current static JSON translation bundles (en.json, vi.json)
migrations/            # Cloudflare D1 schema and seed/migration scripts
public/                # Static assets
dist/                  # Build output artifacts
specs/                 # Spec/plan/task artifacts for features
```

**Structure Decision**: The feature stays within the existing Astro project layout, refreshes the `locales/` data via new `migrations/` scripts, and documents the plan/research under `specs/013-d1-localization-migration/`.

## Complexity Tracking

No constitution violations were triggered, so no extra tracking entries are needed.
