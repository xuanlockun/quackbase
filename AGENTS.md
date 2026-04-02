# astro-blog-starter-template Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-02

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
- 006-ui-text-i18n: Added TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, existing `src/lib/i18n.ts` language helpers, shared Astro layouts/components, RBAC-driven admin navigation, JSON locale dictionaries loaded from the application bundle
- 005-content-i18n: Added TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, Cloudflare D1, existing `src/lib/blog.ts` content helpers, RBAC guards, shared admin Astro components, and `micromark` rendering helpers
- 004-admin-crud-layout: Added TypeScript 5.9, Astro 5, CSS, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, existing admin APIs and RBAC guards, D1-backed content helpers, Bootstrap 5 basic layout and form classes, and shared admin Astro components


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
