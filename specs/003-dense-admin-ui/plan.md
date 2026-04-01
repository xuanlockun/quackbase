# Implementation Plan: Dense Admin UI

**Branch**: `003-dense-admin-ui` | **Date**: 2026-04-01 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\spec.md)  
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\spec.md`

## Summary

Refine the authenticated admin experience into a denser workspace by removing rounded and shadow-heavy treatments, tightening spacing, forcing the content region to full available width, and standardizing compact tables and forms. Implementation will concentrate on shared admin layout and CSS primitives in `src/styles/global.css`, plus the admin layout and component surfaces that currently enforce card-style spacing and decoration.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS  
**Primary Dependencies**: Astro 5, `@astrojs/cloudflare`, existing admin Astro components and shared stylesheet in `src/styles/global.css`  
**Storage**: Cloudflare D1-backed admin content data remains unchanged; feature is presentation-only  
**Testing**: Vitest integration and contract tests, plus focused manual visual validation of admin routes  
**Target Platform**: Astro application running on Cloudflare Workers in desktop and laptop browser viewports, with responsive fallback for narrower widths  
**Project Type**: Web application  
**Performance Goals**: Preserve current admin page responsiveness while increasing above-the-fold information density on table and form views  
**Constraints**: Remove rounded-* styling, reduce padding to compact values generally at `p-2` scale or less where utility-equivalent reasoning applies, reduce margins, use full-width content regions, avoid container max-width patterns for admin pages, and preserve readability and action discoverability  
**Scale/Scope**: Shared admin layout plus key admin surfaces including sidebar, table-heavy pages, form-heavy pages, and reusable admin controls across `src/layouts`, `src/components/admin`, and `src/pages/admin`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file is still template-only placeholder content and defines no actionable governance gates yet. For this feature, the planning gate passes provisionally with the following working checks:

- Keep scope limited to authenticated admin presentation and layout behavior.
- Avoid data-model, permission, or API contract changes unless required by visual implementation.
- Prefer shared style and layout updates over page-by-page divergence.
- Preserve existing automated test surfaces and add focused validation only where UI structure changes affect observable behavior.

**Post-design re-check**: Pass. The planned artifacts keep the feature presentation-only, reuse shared admin primitives, and do not introduce new backend complexity.

## Project Structure

### Documentation (this feature)

```text
specs/003-dense-admin-ui/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- admin-ui-density.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- components/
|   `-- admin/
|       |-- PostForm.astro
|       |-- PostTable.astro
|       |-- RoleEditor.astro
|       |-- Sidebar.astro
|       `-- UserRoleTable.astro
|-- layouts/
|   `-- AdminLayout.astro
|-- pages/
|   `-- admin/
|       |-- header.astro
|       |-- pages.astro
|       |-- permissions.astro
|       |-- posts.astro
|       |-- posts/[id]/edit.astro
|       |-- posts/new.astro
|       |-- roles.astro
|       `-- users.astro
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- admin-rbac-api.spec.ts
`-- integration/
    `-- admin-auth-rbac.spec.ts
```

**Structure Decision**: This is a single Astro web application. The implementation should centralize density rules in `src/styles/global.css` and `src/layouts/AdminLayout.astro`, then update the admin component and page surfaces that still use card-like wrappers or roomy spacing.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
