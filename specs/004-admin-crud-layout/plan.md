# Implementation Plan: Admin CRUD Layout Refactor

**Branch**: `004-admin-crud-layout` | **Date**: 2026-04-01 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\spec.md`

## Summary

Standardize the Astro admin experience for pages, users, and roles by replacing inline create/edit workflows with dedicated list, create, and edit routes, and by aligning those routes under a shared full-width sidebar layout. Implementation will extend the existing `AdminLayout`, introduce reusable entity form and list components, adopt Bootstrap-based layout primitives with minimal custom CSS, and preserve current RBAC and API behavior while moving navigation to explicit links and route-driven screens.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, existing admin APIs and RBAC guards, D1-backed content helpers, Bootstrap 5 basic layout and form classes, and shared admin Astro components  
**Storage**: Cloudflare D1 for pages, users, roles, permissions, and session-backed admin auth state  
**Testing**: Vitest route and contract coverage, `npm test`, `npm run check`, and focused manual validation of admin layout and CRUD navigation  
**Target Platform**: Cloudflare Workers serving Astro pages and Astro API routes in desktop and responsive browser viewports  
**Project Type**: Server-rendered web application with Astro admin frontend routes and Worker-hosted admin APIs  
**Performance Goals**: Preserve current admin responsiveness while rendering each CRUD screen with one server-side load path per page and a full-width content workspace that avoids cramped form/table layouts  
**Constraints**: Use separate routes for list/create/edit pages, prefer navigation links over conditional rendering, keep sidebar fixed-width with content flex growth, use Bootstrap utility and component classes wherever practical, avoid new custom CSS unless Bootstrap utilities cannot express the layout, preserve existing permissions and data behavior, and keep the interface dense and minimally styled  
**Scale/Scope**: One shared admin layout refactor, three entity areas (`pages`, `users`, `roles`), six new dedicated create/edit routes, reusable per-entity form components plus list components, and the minimum API or page-loading adjustments needed to support route-driven CRUD screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` remains a template and does not define enforceable project-specific gates.

- Pre-research gate status: PASS, because no binding constitution rules are currently documented.
- Working checks for this feature:
  - Keep the change focused on admin workflow structure and layout.
  - Reuse existing admin APIs, RBAC guards, and data rules instead of redesigning backend behavior.
  - Prefer shared layout and form components over entity-specific one-off route implementations.
  - Keep Bootstrap usage limited to foundational layout and form patterns so the admin surface stays dense and consistent.
- Post-design gate status: PASS. The design artifacts preserve scope boundaries, reuse current backend contracts, and keep the refactor centered on frontend route and layout standardization.

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-crud-layout/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- admin-crud-ui.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- components/
|   `-- admin/
|       |-- PageForm.astro
|       |-- PageTable.astro
|       |-- RoleForm.astro
|       |-- RoleTable.astro
|       |-- Sidebar.astro
|       |-- UserForm.astro
|       `-- UserTable.astro
|-- layouts/
|   `-- AdminLayout.astro
|-- lib/
|   |-- blog.ts
|   |-- db/
|   |   |-- admin-users.ts
|   |   `-- roles.ts
|   `-- rbac/
|       |-- guards.ts
|       `-- policies.ts
|-- pages/
|   |-- admin/
|   |   |-- pages.astro
|   |   |-- pages/
|   |   |   |-- new.astro
|   |   |   `-- [id]/
|   |   |       `-- edit.astro
|   |   |-- roles.astro
|   |   |-- roles/
|   |   |   |-- new.astro
|   |   |   `-- [id]/
|   |   |       `-- edit.astro
|   |   |-- users.astro
|   |   `-- users/
|   |       |-- new.astro
|   |       `-- [id]/
|   |           `-- edit.astro
|   `-- api/
|       `-- admin/
|           |-- pages.ts
|           |-- pages/delete.ts
|           |-- roles.ts
|           |-- roles/[roleId].ts
|           |-- users.ts
|           `-- users/[userId].ts
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- admin-crud-ui.spec.ts
`-- integration/
    `-- admin-crud-layout.spec.ts
```

**Structure Decision**: Keep the existing single Astro application and extend its current admin area in place. The route split happens under `src/pages/admin`, shared framing remains in `src/layouts/AdminLayout.astro`, and reusable per-entity table/form components live under `src/components/admin`. Existing API routes under `src/pages/api/admin` remain the integration boundary for user and role mutations, while pages continue to post through their existing form endpoint unless a narrowly scoped read helper is needed for edit-route hydration.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
