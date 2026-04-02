# Implementation Plan: Localized Post URLs

**Branch**: `007-localized-post-urls` | **Date**: 2026-04-02 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\007-localized-post-urls\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\007-localized-post-urls\spec.md`

## Summary

Refactor post URLs to remove the `/blog` prefix and serve posts from language-specific clean URLs like `/{lang}/{slug}` by storing `slug` and `description` as localized JSON values alongside existing localized `title` and `content`, resolving posts by the requested language slug with English fallback, extending the admin post workflow to edit and auto-generate slugs per language, and migrating existing single-language slugs into default-language JSON so historical content remains reachable after the rollout.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, existing `src/lib/i18n.ts` language utilities, shared admin Astro components/forms, and `micromark` rendering helpers  
**Storage**: Cloudflare D1 (SQLite) with `posts.slug`, `posts.title`, `posts.description`, and `posts.content` stored as JSON strings in `TEXT` columns; migration wraps legacy scalar slug values into default-language JSON  
**Testing**: Vitest contract and integration coverage, `npm test`, `npm run check`, plus manual validation of admin slug editing, migration behavior, and localized clean post routes  
**Target Platform**: Cloudflare Workers serving Astro frontend pages, admin pages, and admin API routes in desktop and mobile browsers  
**Project Type**: Server-rendered web application with Astro pages, admin dashboards, and Worker-hosted content APIs  
**Performance Goals**: Preserve current post-page responsiveness while adding bounded JSON parse/stringify work for a single post record per request, and keep localized slug resolution lightweight enough for clean route rendering without noticeable delay  
**Constraints**: Remove the `/blog` prefix for public post URLs, use `/{lang}/{slug}` for posts, keep localized post fields in JSON-backed D1 text columns, match posts by language-specific slug, fall back to English for missing translated fields or missing translated slug values when possible, support admin input and auto-generation of per-language slugs, and migrate existing scalar slugs into JSON without losing published content  
**Scale/Scope**: One content entity (`posts`), two initial languages (`en`, `vi`), four localized post fields (`slug`, `title`, `description`, `content`), one localized public route shape for posts, one post migration, and updates to post-focused admin create/edit/list flows plus link generation surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` remains a template and does not define enforceable project-specific gates.

- Pre-research gate status: PASS, because no binding constitution rules are currently documented.
- Working checks for this feature:
  - Keep the refactor scoped to post URLs and post data, without broad page-routing changes.
  - Reuse the existing Astro + D1 content helpers and i18n utilities rather than introducing separate lookup tables or services.
  - Keep localized values lightweight by storing post translations in JSON-backed text columns as requested.
  - Preserve published-content continuity through migration and fallback behavior for missing translations.
- Post-design gate status: PASS. The planned design stays within the existing Astro application, extends the current multilingual content approach, and avoids unnecessary architectural expansion.

## Project Structure

### Documentation (this feature)

```text
specs/007-localized-post-urls/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- localized-post-routes.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
migrations/
`-- [new localized-post migration].sql

src/
|-- components/
|   |-- admin/
|   |   |-- PostForm.astro
|   |   `-- PostTable.astro
|   |-- CmsPageSections.astro
|   `-- Header.astro
|-- layouts/
|   `-- BlogPost.astro
|-- lib/
|   |-- blog.ts
|   `-- i18n.ts
|-- pages/
|   |-- admin/
|   |   |-- posts.astro
|   |   `-- posts/
|   |       |-- new.astro
|   |       `-- [id]/
|   |           `-- edit.astro
|   |-- [lang]/
|   |   `-- [slug].astro
|   |-- [slug].astro
|   `-- blog/
|       `-- [...slug].astro
`-- styles/
    `-- global.css

tests/
|-- contract/
|   `-- localized-post-contract.spec.ts
`-- integration/
    `-- localized-post-routes.spec.ts
```

**Structure Decision**: Keep the current single Astro application and refactor post behavior in place. Post persistence and fallback logic stay centralized in `src/lib/blog.ts`, language resolution continues through `src/lib/i18n.ts`, admin post authoring remains under existing `/admin/posts` flows, and public post rendering moves to `src/pages/[lang]/[slug].astro` while legacy `/blog/...` handling can be reduced to compatibility or redirect behavior during rollout.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
