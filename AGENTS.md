# astro-blog-starter-template Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-01

## Active Technologies
- TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, D1-backed content helpers in `src/lib/blog.ts`, existing RBAC guards and policies, and shared admin UI styles/components (002-admin-ui-refactor)
- Cloudflare D1 `posts` table and existing admin session/cookie infrastructure (002-admin-ui-refactor)
- TypeScript 5.9, Astro 5, CSS + Astro 5, `@astrojs/cloudflare`, existing admin Astro components and shared stylesheet in `src/styles/global.css` (003-dense-admin-ui)
- Cloudflare D1-backed admin content data remains unchanged; feature is presentation-only (003-dense-admin-ui)

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
- 003-dense-admin-ui: Added TypeScript 5.9, Astro 5, CSS + Astro 5, `@astrojs/cloudflare`, existing admin Astro components and shared stylesheet in `src/styles/global.css`
- 002-admin-ui-refactor: Added TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, D1-backed content helpers in `src/lib/blog.ts`, existing RBAC guards and policies, and shared admin UI styles/components

- 001-admin-auth-rbac: Added TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime + Astro, `@astrojs/cloudflare`, Wrangler, D1, a Worker-compatible JWT library, `bcryptjs`, and shared cookie utilities

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
