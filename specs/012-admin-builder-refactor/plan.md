# Implementation Plan: Admin Builder UX Tables

**Branch**: `012-admin-builder-refactor` | **Date**: April 8, 2026 | **Spec**: specs/012-admin-builder-refactor/spec.md  
**Input**: Feature specification from `/specs/012-admin-builder-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Transition the admin builder into compact, Bootstrap-styled tables so admins can explicitly add/remove sections, contact form fields, and navigation rows while reordering everything through drag handles instead of manual numeric inputs.

## Technical Context

**Language/Version**: TypeScript 5.9 targeting Astro 5 with Node.js 22 on Cloudflare Workers  
**Primary Dependencies**: Astro 5, `@astrojs/cloudflare`, Bootstrap 5 utilities, Wrangler tooling, shared admin layouts/components, `micromark` helpers  
**Storage**: Cloudflare D1 (posts, site_pages, languages, navigation/settings, form configuration)  
**Testing**: `npm test`, `npm run lint`, `npm run dev` for local UI verification, manual QA of drag-and-drop tables  
**Target Platform**: Astro 5 front end running on Cloudflare Workers (edge renderer)  
**Project Type**: Web application (Astro-based admin frontend + Cloudflare Workers APIs)  
**Performance Goals**: Keep drag-and-drop adjustments responsive (<1s persistence) and avoid re-render jitter by using the existing data helpers  
**Constraints**: Reuse current persistence endpoints/backends, operate within Cloudflare Worker API surface, remove manual order inputs, and keep helper copy minimal  
**Scale/Scope**: Admin builder screens for page sections, contact form fields, and navigation items in the existing frontend/backend layout

## Constitution Check

*GATE: Constitution file is a placeholder template with no specific rules; no violations detected before Phase 0 research.*

## Project Structure

### Documentation (this feature)

```text
specs/012-admin-builder-refactor/
├── plan.md             # This file (/speckit.plan command output)
├── research.md         # Phase 0 output (/speckit.plan command)
├── data-model.md       # Phase 1 output (/speckit.plan command)
├── quickstart.md       # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── ui-ordering.md  # Phase 1 output (/speckit.plan command)
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
backend/   # Cloudflare Workers APIs, D1 helpers, RBAC/auth logic
frontend/  # Astro admin UI, shared layouts, Bootstrap styling
tests/     # Automated QA/lint/test scripts
```

**Structure Decision**: The work stays inside the existing web application layout: the admin UI tables live under `frontend/` while persistence helpers remain in `backend/`, with rollout guidance captured in `tests/`.

## Complexity Tracking

No constitution violations require justification; drag-and-drop behavior reuses current frontend conventions without new architectural layers.
