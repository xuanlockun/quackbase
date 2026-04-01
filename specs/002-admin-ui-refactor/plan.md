# Implementation Plan: Admin UI Refactor

**Branch**: `002-admin-ui-refactor` | **Date**: 2026-04-01 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\002-admin-ui-refactor\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\002-admin-ui-refactor\spec.md`

## Summary

Refactor the Astro-based admin post management experience into a page-oriented workflow built around a reusable `AdminLayout`, a persistent left sidebar, and dedicated routes for listing, creating, and editing posts. The implementation will replace the current stacked `/admin/posts` screen with focused pages, reuse a shared `PostForm` across create and edit routes, introduce a reusable `PostTable`, and add API-backed loading for the posts list and individual post editor state while preserving existing RBAC behavior.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, D1-backed content helpers in `src/lib/blog.ts`, existing RBAC guards and policies, and shared admin UI styles/components  
**Storage**: Cloudflare D1 `posts` table and existing admin session/cookie infrastructure  
**Testing**: Vitest for route/helper coverage, Astro build validation, Wrangler dry-run via `npm run check`, and focused integration coverage for admin navigation and post workflow routes  
**Target Platform**: Cloudflare Workers serving Astro pages and Astro API routes  
**Project Type**: Server-rendered web application with Astro frontend routes and Worker-hosted admin APIs  
**Performance Goals**: Admin post list and editor routes keep perceived navigation responsive for typical editorial use, with one API or D1 fetch path per primary page load and no unnecessary duplicate data loading  
**Constraints**: Preserve current permission checks, keep one primary task component per page, support direct deep links to create/edit routes, use link-based navigation instead of conditional rendering, and keep the sidebar usable across supported admin breakpoints  
**Scale/Scope**: One shared admin layout, one sidebar component, one reusable posts table component, one reusable post form component, three dedicated post management routes, and the minimum API additions needed to power page-based post workflows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` is still an unfilled template and does not define enforceable project-specific principles or gates.

- Pre-research gate status: PASS, because no binding constitution rules are currently documented.
- Post-design gate status: PASS, because the planned design does not conflict with any explicit governance rules in the repository.
- Follow-up note: If the constitution is later defined, this plan should be revalidated before implementation begins.

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-ui-refactor/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- admin-post-workflow.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- components/
|   |-- AdminNav.astro
|   `-- admin/
|       |-- PostForm.astro
|       |-- PostTable.astro
|       `-- Sidebar.astro
|-- layouts/
|   `-- AdminLayout.astro
|-- lib/
|   |-- blog.ts
|   `-- rbac/
|       |-- guards.ts
|       `-- policies.ts
|-- pages/
|   |-- admin/
|   |   |-- index.astro
|   |   |-- posts.astro
|   |   `-- posts/
|   |       |-- new.astro
|   |       `-- [id]/
|   |           `-- edit.astro
|   `-- api/
|       `-- admin/
|           |-- posts.ts
|           |-- posts/
|           |   |-- [id].ts
|           |   `-- delete.ts
|           `-- ...
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- admin-post-workflow.spec.ts
`-- integration/
    `-- admin-post-ui.spec.ts
```

**Structure Decision**: Keep the existing single Astro application and introduce a dedicated admin layout layer plus focused post-management components under `src/components/admin`. Route files remain under `src/pages/admin`, but the posts workflow expands into nested create and edit routes so navigation becomes URL-driven instead of conditionally rendering multiple views in one page. The API surface stays in Astro API routes under `src/pages/api/admin`, with small additions for post list/detail retrieval and route-specific update behavior where needed.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
