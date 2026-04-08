# Implementation Plan: Language Management System

**Branch**: `010-language-management` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-language-management/spec.md`

This feature introduces admin-driven language management (CRUD/toggle), a shared dropdown-based switch, and routing/fallback fixes so /{lang} routes always resolve without duplicate prefixes.

## Summary

Admin users gain `/admin/languages` to manage languages (code, display name, enabled flag, default flag) while ensuring at least one language stays enabled and only one default exists. The public and admin UI share a dropdown component that renders enabled languages from the database and highlights the current selection. Routing is driven by the same dataset so dynamic /{lang} prefixes load translations, prevent duplicate prefixes, and fall back to the default language when a code or translation is missing.

## Technical Context

**Language/Version**: TypeScript 5.9 running inside Astro 5 + Node.js 22 on Cloudflare Workers  
**Primary Dependencies**: Astro 5 renderer, `@astrojs/cloudflare`, Cloudflare D1 (SQLite), existing admin UI components/styles (shared Astro layouts), RBAC guards from `src/lib/auth`, `micromark` for rendering any markdown-rich copy  
**Storage**: Cloudflare D1 SQLite (current `posts`, `site_pages`, `languages` tables)  
**Testing**: `npm test`, `npm run lint`, plus manual QA in admin UI  
**Target Platform**: Cloudflare Workers (edge) frontend and admin SPA in Astro  
**Project Type**: Web application (frontend + admin backend services leveraging D1)  
**Performance Goals**: No regressions to current page-load targets (sub-second navigation); language table reads must stay cached/efficient via existing content helpers  
**Constraints**: Language list must enforce unique default + at least one enabled option; routing helpers must not append duplicate prefixes when switching languages; admin UI must reuse existing styling to align with shared CSS (Bootstrap 5 utilities already in use)  
**Scale/Scope**: Limited to admin language CRUD, dropdown UI, and routing/fallback logic for multilingual experiences using the existing D1-backed content pipeline

## Constitution Check

Gate requirements are placeholders (constitution file empty), so no violations to resolve. Plan proceeds without additional gates.

## Project Structure

### Documentation (this feature)

```text
specs/010-language-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── languages-api.md
└── tasks.md             # created later by /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── services/
│   └── db/
frontend/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── lib/
tests/
├── integration/
└── unit/
```

**Structure Decision**: This feature spans both backend (language CRUD APIs + routing helpers) and frontend/admin (shared dropdown component, `/admin/languages` page). The backend handles Cloudflare D1 access while the frontend reuses shared components in `frontend/src/components`/`layouts`.

## Complexity Tracking

No constitution violations or additional complexity justifications required for this feature.
