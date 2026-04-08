# Implementation Plan: Dynamic Multi-Language System

**Branch**: `009-dynamic-multilang-i18n` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification plus planning notes: D1 `languages` table (`code`, `name`, `enabled`, `is_default`); posts `title` / `slug` / `description` as JSON; load enabled languages and default from DB; language switch and routing without hardcoded locale lists; `/{lang}/{slug}`; fallback to default when translation missing.

## Summary

Deliver a **database-driven language catalog** so administrators can add, enable/disable, and set a single default language. **Public and admin language switches** render options from enabled rows (labels from `name`). **Content** continues to use per-field JSON maps keyed by `code`; **resolution** uses the current default language from D1 when a key is missing. **Routing** keeps the dynamic Astro route `src/pages/[lang]/[slug].astro` but validates `lang` against enabled codes and applies **redirect-or-404** rules from [research.md](./research.md) for invalid segments. Refactor `src/lib/i18n.ts` (and callers) to remove hardcoded `SUPPORTED_LANGUAGES` / `DEFAULT_LANGUAGE` for content and switch behavior, replacing them with loaders that query D1 (or request-scoped cached helpers).

## Technical Context

**Language/Version**: TypeScript 5.9, Node.js 22  
**Primary Dependencies**: Astro 5.16.x, `@astrojs/cloudflare`, Wrangler 4.x  
**Storage**: Cloudflare D1 (SQLite); new `languages` table; existing `posts` JSON columns  
**Testing**: Vitest (existing), `npm test`; lint via `npm run lint`  
**Target Platform**: Cloudflare Workers (Astro SSR)  
**Project Type**: Web application (monorepo-style `src/` Astro app)  
**Performance Goals**: Language list small; single query or batched read per request acceptable; avoid N+1 on post lists  
**Constraints**: Worker CPU/time; D1 latency; must preserve RBAC on admin language APIs  
**Scale/Scope**: Unlimited catalog size in spec; practical UI ordering by `name` until a `sort_order` column is added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still a **placeholder** (no ratified principles). Interim gates:

| Gate | Status |
|------|--------|
| Align with **AGENTS.md** stack (TypeScript, Astro, D1, RBAC) | Pass |
| No unexplained NEEDS CLARIFICATION in Technical Context | Pass (resolved in [research.md](./research.md)) |
| Feature spec FR coverage | Pass — design maps to FR-001–FR-010 |

**Post–Phase 1 re-check**: Data model and contracts stay within D1 + Astro + admin API patterns; no new runtime dependency required.

## Project Structure

### Documentation (this feature)

```text
specs/009-dynamic-multilang-i18n/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   └── dynamic-languages.yaml
└── tasks.md             # Phase 2 (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── i18n.ts              # Replace hardcoded lists; DB-backed language resolution
│   ├── blog.ts              # Post queries; fallback uses DB default code
│   └── (new) languages.ts   # Optional: D1 helpers for languages table
├── pages/
│   ├── [lang]/
│   │   ├── [slug].astro     # Validate lang against DB; redirect if invalid
│   │   └── blog/[...slug].astro
│   └── api/
│       └── admin/
│           └── languages/   # New CRUD endpoints (pattern match existing admin APIs)
migrations/
└── NNNN_languages.sql         # New migration
tests/
└── (extend or add tests for resolve + routing helpers)
```

**Structure Decision**: Single Astro + D1 codebase under `src/`; new migration in `migrations/`; admin JSON API under `src/pages/api/admin/` consistent with existing posts/users patterns.

## Complexity Tracking

> No constitution violations requiring justification. Schema stays minimal per user input (no extra columns).

## Phase 0 & 1 Outputs (this command)

| Artifact | Path |
|----------|------|
| Research | [research.md](./research.md) |
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/dynamic-languages.yaml](./contracts/dynamic-languages.yaml) |
| Quickstart | [quickstart.md](./quickstart.md) |

## Implementation notes (for tasks phase)

1. **Migration**: Create `languages`, seed from current `en`/`vi` (or single default), backfill `is_default`.
2. **i18n refactor**: `getSupportedLanguages` → async or pass-through from `Astro.locals` populated in middleware/layout; `resolveLocalizedValue` must use **DB default code**; `normalizeLocalizedText` “require default” must use that code.
3. **Pages**: `[lang]/[slug].astro` — if `lang` not enabled, redirect to `/{defaultCode}/...` when possible.
4. **Admin UI**: CRUD screens for languages; reuse Bootstrap patterns from admin CRUD work.
5. **OpenAPI follow-up**: Regenerate or extend [localized-post-routes.yaml](../007-localized-post-urls/contracts/localized-post-routes.yaml) `Language` parameter from fixed enum to dynamic string when implementation is stable.
