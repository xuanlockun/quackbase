# Implementation Plan: Admin builder table UX

**Branch**: `011-admin-builder` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/011-admin-builder/spec.md`

**Note**: This output follows the `/speckit.plan` workflow described in `.specify/templates/plan-template.md`.

## Summary

Switch the admin builder to compact, Bootstrap-styled tables that replace manual order inputs with drag-and-drop rows, add/remove actions, and minimal helper copy for page sections, contact form fields, and navigation items, while persisting ordered arrays to the existing Cloudflare D1 storage instead of nebulous numeric columns.

## Technical Context

**Language/Version**: TypeScript 5.9 + Astro 5 + Node.js 22 (Cloudflare Workers runtime)  
**Primary Dependencies**: `@astrojs/cloudflare`, Cloudflare D1 helpers, Bootstrap 5 form/layout utilities, `micromark`, and a lightweight drag-and-drop helper (e.g., `SortableJS` or a thin HTML5 wrapper to handle reorder events)  
**Storage**: Cloudflare D1 (SQLite) tables for `posts`, `navigation_items`, `form_fields`, and admin settings; order is derived from array order saved in JSON/text columns  
**Testing**: `npm test`, `npm run lint`, plus manual UI testing in the local Astro dev server to verify drag-and-drop persistence  
**Target Platform**: Astro-rendered admin UI served from Cloudflare Workers, accessed via modern browsers  
**Project Type**: Web application (admin frontend with backend helpers)  
**Performance Goals**: Keep drag/drop interactions and table reorders responsive (<100 ms perceived latency) even with dozens of rows  
**Constraints**: Cloudflare Worker execution and bundle size limits, synchronous writes to D1, limited DOM capabilities in the Astro shell, and the need to avoid heavy client frameworks  
**Scale/Scope**: Admin-facing builder screens located under `frontend/src/components/admin/builder/*` plus the backend support code in `backend/src/lib/*`

## Constitution Check

*GATE: Constitution document contains placeholders only, so no specific gates or violations are defined. Assume the check passes for this rewrite; revisit if future constitution entries appear.*  
No complex gates detected before Phase 0; re-evaluate after Phase 1 if new constraints emerge.

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-builder/
├── plan.md          # This file (output of /speckit.plan)
├── research.md      # Phase 0 research decisions
├── data-model.md    # Phase 1 data model
├── quickstart.md    # Phase 1 quickstart instructions
├── contracts/
│   └── admin-ui.md  # Phase 1 UI contract
└── [future tasks].md # Phase 2 output via /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   └── lib/
│       └── admin.ts       # D1 helpers for page builder settings
│
frontend/
├── src/
│   ├── components/
│   │   └── admin/
│   │       └── builder/
│   │           ├── sections.tsx
│   │           ├── contact-form.tsx
│   │           └── navigation.tsx
│   ├── layouts/
│   │   └── admin-layout.astro
│   └── styles/
│       └── admin.css
└── tests/

tests/
└── integration/
```

**Structure Decision**: The feature builds entirely on the existing frontend/backend split — admin UI tweaks live under `frontend/src/components/admin/builder`, while persistence/order normalization touches `backend/src/lib/admin.ts` (the shared entry point for D1 saves).

## Complexity Tracking

No constitution violations or extra complexity approvals are required at this stage.
