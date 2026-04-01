# Implementation Plan: Admin Authentication RBAC

**Branch**: `001-admin-auth-rbac` | **Date**: 2026-04-01 | **Spec**: [spec.md](D:\Projects\edge_cms\astro-blog-starter-template\specs\001-admin-auth-rbac\spec.md)
**Input**: Feature specification from `D:\Projects\edge_cms\astro-blog-starter-template\specs\001-admin-auth-rbac\spec.md`

## Summary

Replace the current single shared admin-token model with a user-based authentication and authorization system for `/admin` using Cloudflare Workers, D1, JWTs stored in HTTP-only cookies, and permission-driven RBAC. The Astro frontend will keep rendering the admin dashboard pages, while Worker-backed API routes and middleware enforce authentication, resolve effective permissions from D1 on each request, and expose REST-style endpoints for login, users, roles, and permission assignment.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, Node.js 22 compatibility in the Cloudflare Workers runtime  
**Primary Dependencies**: Astro, `@astrojs/cloudflare`, Wrangler, D1, a Worker-compatible JWT library, `bcryptjs`, and shared cookie utilities  
**Storage**: Cloudflare D1 for users, roles, permissions, join tables, and existing CMS content tables; Worker secrets for JWT signing  
**Testing**: TypeScript compile checks, Astro build, Wrangler dry-run, targeted integration tests for auth and RBAC helpers, and API contract validation for admin endpoints  
**Target Platform**: Cloudflare Workers serving Astro pages and API routes  
**Project Type**: Server-rendered web application with Worker-hosted API endpoints and Astro frontend pages  
**Performance Goals**: Authenticated admin route checks complete within one D1-backed request cycle and keep perceived navigation under 500 ms for typical admin traffic  
**Constraints**: All `/admin` routes must be protected, authorization must be permission-based rather than role-name checks, JWTs must live only in HTTP-only cookies, and access changes must take effect on the next protected request  
**Scale/Scope**: One admin surface with login, user management, role management, and permission assignment screens; initial system roles `superadmin` and `editor`; future-ready for additional roles and permissions without schema redesign

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution at `D:\Projects\edge_cms\astro-blog-starter-template\.specify\memory\constitution.md` is still a placeholder template with no project-specific enforceable principles, constraints, or gates defined.

- Pre-research gate status: PASS, because no binding rules are currently specified.
- Post-design gate status: PASS, because the generated design artifacts do not conflict with any documented constitution requirements.
- Follow-up note: If a real constitution is added later, this plan should be re-checked against those rules before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-auth-rbac/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- admin-rbac-api.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
migrations/
|-- 0001_create_posts.sql
`-- 0002_admin_auth_rbac.sql

src/
|-- components/
|   |-- AdminNav.astro
|   `-- admin/
|       |-- PermissionBadge.astro
|       |-- RoleEditor.astro
|       `-- UserRoleTable.astro
|-- layouts/
|-- lib/
|   |-- blog.ts
|   |-- auth/
|   |   |-- cookies.ts
|   |   |-- jwt.ts
|   |   |-- passwords.ts
|   |   `-- session.ts
|   |-- db/
|   |   |-- admin-users.ts
|   |   |-- permissions.ts
|   |   `-- roles.ts
|   `-- rbac/
|       |-- guards.ts
|       |-- permissions.ts
|       `-- policies.ts
|-- middleware.ts
|-- pages/
|   |-- admin/
|   |   |-- index.astro
|   |   |-- login.astro
|   |   |-- permissions.astro
|   |   |-- roles.astro
|   |   `-- users.astro
|   `-- api/
|       `-- admin/
|           |-- auth/
|           |   |-- login.ts
|           |   `-- logout.ts
|           |-- permissions.ts
|           |-- roles.ts
|           `-- users.ts
`-- env.d.ts
```

**Structure Decision**: Keep the existing single Astro application and extend it with dedicated auth, RBAC, and D1-access modules under `src/lib`, a repository-wide `src/middleware.ts` for admin route protection, new admin UI pages under `src/pages/admin`, Worker-executed REST endpoints under `src/pages/api/admin`, and one additional D1 migration for the auth/RBAC schema. This preserves the current Cloudflare/Astro deployment model while introducing clear boundaries between page rendering, middleware, persistence, and authorization policy logic.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
