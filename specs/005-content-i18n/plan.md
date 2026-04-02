# Implementation Plan: Multilingual Content Support

**Branch**: `005-content-i18n` | **Date**: 2026-04-02 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\spec.md`

## Summary

Add lightweight multilingual support for posts and pages by storing localized `title` and `content` values as JSON strings in Cloudflare D1 `TEXT` columns, exposing parsed translation objects through the admin/content APIs, extending the admin forms with language tabs or grouped inputs, and serving localized frontend content from language-prefixed URLs such as `/en/...` and `/vi/...` with English fallback when a translation is missing.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, RBAC guards, shared admin Astro components, and `micromark` rendering helpers  
**Storage**: Cloudflare D1 (SQLite) with localized `title` and `content` persisted as JSON strings in `TEXT` columns for `posts` and `site_pages`  
**Testing**: Vitest integration and contract coverage, `npm test`, `npm run check`, plus focused manual validation of multilingual admin editing and localized frontend routes  
**Target Platform**: Cloudflare Workers serving Astro admin pages, Astro API routes, and localized public content routes in desktop and mobile browsers  
**Project Type**: Server-rendered web application with Astro frontend pages and Worker-hosted admin/content APIs  
**Performance Goals**: Preserve current page-load responsiveness while adding JSON parse/stringify work that stays bounded to a single content record or list row, and keep localized content rendering within the current server-side request model  
**Constraints**: Reuse D1-backed content helpers instead of adding a separate translation table, keep localized fields in JSON-backed `TEXT` columns, accept translation payloads through existing admin APIs, parse JSON on read and stringify on write, derive language from URL prefixes like `/en/` and `/vi/`, preserve English fallback behavior, and keep the initial scope limited to `title` and `content` for posts and pages  
**Scale/Scope**: Two content entities (`posts`, `site_pages`), two initial languages (`en`, `vi`), one shared language configuration, updated admin create/edit flows for posts and pages, localized public routes for posts and pages, and migration coverage for existing English-only records

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` remains a template and does not define enforceable project-specific gates.

- Pre-research gate status: PASS, because no binding constitution rules are currently documented.
- Working checks for this feature:
  - Keep multilingual support scoped to posts and pages plus the admin/public flows that read and write them.
  - Reuse the existing D1 content helpers and admin API boundaries instead of introducing a separate translation service.
  - Keep the data model lightweight by storing localized values in JSON-backed text columns as requested.
  - Preserve current English-only records and existing non-translatable fields during the rollout.
- Post-design gate status: PASS. The planned design stays within the existing Astro + D1 architecture, keeps scope focused on multilingual content behavior, and avoids adding unnecessary infrastructure.

## Project Structure

### Documentation (this feature)

```text
specs/005-content-i18n/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- content-i18n-api.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- components/
|   |-- admin/
|   |   |-- PageForm.astro
|   |   |-- PostForm.astro
|   |   `-- [shared language editor helper component if needed]
|   |-- CmsPageSections.astro
|   `-- [public language selector component if needed]
|-- layouts/
|   `-- BlogPost.astro
|-- lib/
|   |-- blog.ts
|   `-- [language helper module if needed]
|-- pages/
|   |-- admin/
|   |   |-- pages/
|   |   |   |-- new.astro
|   |   |   `-- [id]/
|   |   |       `-- edit.astro
|   |   `-- posts/
|   |       |-- new.astro
|   |       `-- [id]/
|   |           `-- edit.astro
|   |-- api/
|   |   `-- admin/
|   |       |-- pages.ts
|   |       |-- posts.ts
|   |       `-- posts/
|   |           `-- [id].ts
|   |-- [slug].astro
|   |-- [lang]/
|   |   |-- [slug].astro
|   |   `-- blog/
|   |       `-- [...slug].astro
|   `-- blog/
|       `-- [...slug].astro
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- content-i18n-api.spec.ts
`-- integration/
    `-- content-i18n-routes.spec.ts
```

**Structure Decision**: Keep the existing single Astro application and extend its current content helpers and routes in place. Multilingual persistence remains centralized in `src/lib/blog.ts`, admin editing stays under the existing `/admin/posts` and `/admin/pages` flows, and public rendering adds language-prefixed route variants under `src/pages/[lang]/...` so the URL itself determines which localized content values to render.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
