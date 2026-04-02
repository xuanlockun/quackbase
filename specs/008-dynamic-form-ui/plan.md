# Implementation Plan: Dynamic Form UI

**Branch**: `008-dynamic-form-ui` | **Date**: 2026-04-02 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\008-dynamic-form-ui\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\008-dynamic-form-ui\spec.md`

## Summary

Improve frontend consistency and introduce a flexible contact form system by extracting the existing language switch into a reusable shared component used by both admin and client surfaces, redesigning the banner and contact form presentation for cleaner hierarchy and Bootstrap-aligned spacing, storing configurable multilingual contact form fields in D1, rendering those fields dynamically on the frontend in the active language, and persisting submitted form responses in D1.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, existing `src/lib/i18n.ts` language utilities, shared Astro admin/frontend components, Bootstrap 5 utility and form classes, and RBAC-protected admin pages  
**Storage**: Cloudflare D1 (SQLite) with a new `form_fields` table for dynamic field configuration and a new `form_submissions` table for submitted values; multilingual field labels stored as JSON strings in text columns  
**Testing**: Vitest contract and integration coverage, `npm test`, `npm run check`, plus manual validation of admin field configuration, frontend multilingual rendering, submission flow, and responsive layout behavior  
**Target Platform**: Cloudflare Workers serving Astro frontend pages, admin pages, and form submission routes in desktop and mobile browsers  
**Project Type**: Server-rendered web application with Astro frontend pages, shared UI components, and Worker-hosted admin/content APIs  
**Performance Goals**: Keep shared component rendering lightweight, load contact form configuration with one bounded D1 read per request context, and preserve responsive page rendering without noticeable delay when switching languages or loading dynamic form sections  
**Constraints**: Reuse one shared language switch component across admin and frontend, keep banner and contact section presentation clean and minimal, use Bootstrap-aligned form styling for the public contact form, store field labels as multilingual JSON, support text/email/textarea field types, support reordering in admin, sort fields by configured order on render, and persist submissions in D1 without expanding scope into a full messaging platform  
**Scale/Scope**: One shared `LanguageSwitch` component, one banner presentation refresh, one dynamic frontend `DynamicForm` component, one admin field-configuration workflow, two new D1 tables (`form_fields`, `form_submissions`), two initial languages (`en`, `vi`), and one multilingual public contact form submission flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` remains a template and does not define enforceable project-specific gates.

- Pre-research gate status: PASS, because there are no binding constitution rules documented for this repository.
- Working checks for this feature:
  - Reuse and extract existing UI patterns instead of creating parallel language-switch implementations.
  - Extend the current page-section/admin editing flow for contact form configuration where practical.
  - Keep the dynamic form system lightweight by using D1-backed field configuration and submissions rather than a broader form-builder platform.
  - Preserve multilingual fallback behavior for field labels and existing page rendering patterns.
- Post-design gate status: PASS. The planned design stays inside the current Astro + D1 architecture, reuses existing admin/page configuration surfaces, and keeps scope focused on shared UI consistency plus dynamic form behavior.

## Project Structure

### Documentation (this feature)

```text
specs/008-dynamic-form-ui/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- dynamic-form-ui.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
migrations/
`-- [new dynamic form migration].sql

src/
|-- components/
|   |-- admin/
|   |   |-- PageForm.astro
|   |   `-- [dynamic field editor helper if extracted]
|   |-- BannerSection.astro
|   |-- CmsPageSections.astro
|   |-- DynamicForm.astro
|   |-- Header.astro
|   `-- LanguageSwitch.astro
|-- lib/
|   |-- blog.ts
|   |-- forms.ts
|   `-- i18n.ts
|-- pages/
|   |-- admin/
|   |   |-- header.astro
|   |   `-- pages/
|   |       `-- [id]/
|   |           `-- edit.astro
|   |-- api/
|   |   `-- forms/
|   |       `-- contact.ts
|   |-- [lang]/
|   |   `-- [slug].astro
|   |-- [slug].astro
|   `-- index.astro
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- dynamic-form-ui-contract.spec.ts
`-- integration/
    `-- dynamic-form-ui-routes.spec.ts
```

**Structure Decision**: Keep the current single Astro application and extend its existing component and page-section architecture. Shared language switching moves into a reusable component used by both `Header.astro` and admin navigation, page-section rendering remains centered in `CmsPageSections.astro`, and dynamic form persistence is isolated in a small `src/lib/forms.ts` helper layer with D1-backed admin/frontend routes.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
