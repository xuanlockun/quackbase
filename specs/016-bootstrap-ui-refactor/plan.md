# Implementation Plan: Bootstrap UI Standardization

**Branch**: `016-bootstrap-ui-refactor` | **Date**: 2026-04-13 | **Spec**: specs/016-bootstrap-ui-refactor/spec.md

**Input**: Feature specification from `/specs/016-bootstrap-ui-refactor/spec.md`

## Summary

Audit every admin and public layout, navigation, form, table, card, badge, alert, and interaction so Bootstrap 5.3.8 (via the provided CDN assets) drives spacing, grids, and interactive components while the existing RBAC guards, data fetching, and AJAX scripts remain untouched.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, Node.js 22 (Cloudflare Workers compatible)  
**Primary Dependencies**: Astro 5, `@astrojs/cloudflare`, Wrangler 4.x, Cloudflare Workers runtime, Cloudflare D1 helpers in `src/lib/blog.ts`  
**Storage**: Cloudflare D1 (SQLite) tables for posts, pages, languages, permissions, sessions, forms  
**Testing**: `npm test`, `npm run lint`, and manual UI verification in Astro/Cloudflare dev server  
**Target Platform**: Static/public site + admin shell served via Astro on Cloudflare Workers with shared CDN assets  
**Project Type**: Web application (public marketing site + RBAC admin CMS)  
**Performance Goals**: Keep navigation and form interactions fast (<200 ms perceived) by relying on Bootstrap’s lightweight CSS/JS bundle and avoiding excessive custom rendering logic  
**Constraints**: Must keep compatibility with Cloudflare Workers (no Node.js internals), maintain existing authentication/session flow, and avoid shipping duplicate Bootstrap builds  
**Scale/Scope**: Applies to all public components/layouts (`src/components`, `src/layouts/BlogPost.astro`, `src/pages`/`src/components`) plus admin layouts/components/tables/forms under `src/layouts/AdminLayout.astro` and `src/components/admin/*`, along with shared `src/styles/global.css` and `BaseHead.astro`

## Constitution Check

The constitution file contains only placeholders, so no additional gates or mandatory checks are defined for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/016-bootstrap-ui-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BannerSection.astro
│   ├── CmsPageSections.astro
│   ├── DynamicForm.astro
│   ├── Header.astro
│   ├── HeaderLink.astro
│   ├── Footer.astro
│   ├── BaseHead.astro
│   └── admin/
│       ├── Sidebar.astro
│       ├── PostTable.astro
│       ├── PostForm.astro
│       ├── PageTable.astro
│       ├── PageForm.astro
│       ├── RoleTable.astro
│       ├── RoleForm.astro
│       ├── UserTable.astro
│       ├── UserForm.astro
│       ├── LanguageTable.astro
│       ├── LanguageForm.astro
│       ├── PermissionBadge.astro
│       └── LanguageSwitch.astro
├── layouts/
│   ├── BlogPost.astro
│   └── AdminLayout.astro
├── pages/
│   └── admin/
│       ├── posts/
│       ├── pages/
│       ├── roles/
│       ├── users/
│       └── languages/
├── styles/
│   └── global.css
└── lib/
    ├── blog.ts
    ├── i18n.ts
    ├── forms.ts
    └── auth/
```

**Structure Decision**: This plan works within the existing Astro project layout by updating shared layouts/components and the global stylesheet to rely on Bootstrap, plus ensuring CDN assets are injected via `BaseHead.astro`.

## Complexity Tracking

No constitution violations were triggered, so no complexity tracking rows are needed.
