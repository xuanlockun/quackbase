# astro-blog-starter-template Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-13

## Active Technologies
- TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, D1-backed content helpers in `src/lib/blog.ts`, existing RBAC guards and policies, and shared admin UI styles/components (002-admin-ui-refactor)
- Cloudflare D1 `posts` table and existing admin session/cookie infrastructure (002-admin-ui-refactor)
- TypeScript 5.9, Astro 5, CSS + Astro 5, `@astrojs/cloudflare`, existing admin Astro components and shared stylesheet in `src/styles/global.css` (003-dense-admin-ui)
- Cloudflare D1-backed admin content data remains unchanged; feature is presentation-only (003-dense-admin-ui)
- TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, existing admin APIs and RBAC guards, D1-backed content helpers, Bootstrap 5 basic layout and form classes, and shared admin Astro components (004-admin-crud-layout)
- Cloudflare D1 for pages, users, roles, permissions, and session-backed admin auth state (004-admin-crud-layout)
- TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, RBAC guards, shared admin Astro components, and `micromark` rendering helpers (005-content-i18n)
- Cloudflare D1 (SQLite) with localized `title` and `content` persisted as JSON strings in `TEXT` columns for `posts` and `site_pages` (005-content-i18n)
- TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, existing `src/lib/i18n.ts` language helpers, shared Astro layouts/components, RBAC-driven admin navigation, JSON locale dictionaries loaded from the application bundle (006-ui-text-i18n)
- File-based locale dictionaries in `/locales/*.json`; optional cookie-backed saved language preference for interface language; no database storage for UI copy (006-ui-text-i18n)
- TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, existing `src/lib/i18n.ts` language utilities, shared admin Astro components/forms, and `micromark` rendering helpers (007-localized-post-urls)
- Cloudflare D1 (SQLite) with `posts.slug`, `posts.title`, `posts.description`, and `posts.content` stored as JSON strings in `TEXT` columns; migration wraps legacy scalar slug values into default-language JSON (007-localized-post-urls)
- TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, existing `src/lib/i18n.ts` language utilities, shared Astro admin/frontend components, Bootstrap 5 utility and form classes, and RBAC-protected admin pages (008-dynamic-form-ui)
- Cloudflare D1 (SQLite) with a new `form_fields` table for dynamic field configuration and a new `form_submissions` table for submitted values; multilingual field labels stored as JSON strings in text columns (008-dynamic-form-ui)
- TypeScript 5.9, Node.js 22 + Astro 5.16.x, `@astrojs/cloudflare`, Wrangler 4.x (009-dynamic-multilang-i18n)
- Cloudflare D1 (SQLite); new `languages` table; existing `posts` JSON columns (009-dynamic-multilang-i18n)
- TypeScript 5.9 running inside Astro 5 + Node.js 22 on Cloudflare Workers + Astro 5 renderer, `@astrojs/cloudflare`, Cloudflare D1 (SQLite), existing admin UI components/styles (shared Astro layouts), RBAC guards from `src/lib/auth`, `micromark` for rendering any markdown-rich copy (010-language-management)
- Cloudflare D1 SQLite (current `posts`, `site_pages`, `languages` tables) (010-language-management)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (012-admin-builder-refactor)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (012-admin-builder-refactor)
- TypeScript 5.9, Astro 5, Node.js 22 (Cloudflare Workers compatible) + Astro 5, `@astrojs/cloudflare`, Wrangler 4.x, Cloudflare Workers runtime, Cloudflare D1 helpers in `src/lib/blog.ts` (016-bootstrap-ui-refactor)
- Cloudflare D1 (SQLite) tables for posts, pages, languages, permissions, sessions, forms (016-bootstrap-ui-refactor)
- TypeScript 5.9, Astro 5, Node.js 22 + Bootstrap 5, `@astrojs/cloudflare`, Wrangler, existing admin Astro layouts/components, shared i18n and RBAC helpers (017-emdash-admin-ui)
- Cloudflare D1 SQLite for existing admin data; no schema changes required for the UI refactor (017-emdash-admin-ui)

- TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, D1, a Worker-compatible JWT library, `bcryptjs`, and shared cookie utilities (001-admin-auth-rbac)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime: Follow standard conventions

## Recent Changes
- 017-emdash-admin-ui: Added TypeScript 5.9, Astro 5, Node.js 22 + Bootstrap 5, `@astrojs/cloudflare`, Wrangler, existing admin Astro layouts/components, shared i18n and RBAC helpers
- 016-bootstrap-ui-refactor: Added TypeScript 5.9, Astro 5, Node.js 22 (Cloudflare Workers compatible) + Astro 5, `@astrojs/cloudflare`, Wrangler 4.x, Cloudflare Workers runtime, Cloudflare D1 helpers in `src/lib/blog.ts`
- 015-manage-language-translations: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
