# Research: Admin Authentication RBAC

## Decision 1: Use signed JWTs in HTTP-only cookies with identity-only claims

- **Decision**: Store a short-lived signed JWT in an HTTP-only, `SameSite=Strict` cookie for admin authentication. Keep the token payload minimal by including only the user identifier and standard token metadata, then resolve roles and permissions from D1 on each protected request.
- **Rationale**: This matches the required security model, keeps tokens small, and ensures role or permission changes take effect on the next request without waiting for token expiry. It also avoids hardcoding role membership into the cookie payload.
- **Alternatives considered**:
  - Embed full permissions in the JWT: rejected because permission changes would remain stale until token renewal.
  - Keep the current shared admin-token cookie: rejected because it cannot represent per-user identity or scalable RBAC.
  - Use server-side sessions in D1: rejected for v1 because it adds session lifecycle tables and cleanup complexity not required by the requested schema.

## Decision 2: Use `bcryptjs` for password hashing in the Worker runtime

- **Decision**: Hash and verify passwords with `bcryptjs`, which implements the bcrypt algorithm in pure JavaScript and runs within the Cloudflare Worker environment using the repository’s existing Node compatibility mode.
- **Rationale**: The feature requires bcrypt-based password hashing, and `bcryptjs` avoids native binary dependencies that are fragile in Worker deployments.
- **Alternatives considered**:
  - Native `bcrypt`: rejected because native module support is harder to maintain in the Worker bundle.
  - Argon2 or scrypt: rejected because the requirement explicitly calls for bcrypt.

## Decision 3: Enforce authorization through shared permission middleware and guard helpers

- **Decision**: Add a central `src/middleware.ts` to protect `/admin` page requests and shared guard helpers for API endpoints so both rendered pages and REST handlers use the same permission-resolution flow.
- **Rationale**: Route-level protection satisfies the requirement to protect all `/admin` routes, while shared guard helpers ensure action-level enforcement for API operations and avoid duplicating authorization logic.
- **Alternatives considered**:
  - Guard each page and endpoint manually with ad hoc checks: rejected because it is easy to miss routes and increases drift.
  - Role-name checks in page code: rejected because the requirement is permission-based authorization, not hardcoded role branching.

## Decision 4: Model RBAC in D1 with normalized join tables and seeded system roles

- **Decision**: Add D1 tables for `users`, `roles`, `permissions`, `user_roles`, and `role_permissions`, with uniqueness constraints and seeded `superadmin` and `editor` roles plus an initial permission catalog.
- **Rationale**: This matches the requested schema directly, supports many-to-many assignment, and allows roles and permissions to evolve without altering the data model.
- **Alternatives considered**:
  - Store permissions as JSON on the role record: rejected because it complicates querying, indexing, and relational integrity.
  - Store a single role on each user: rejected because the requirements and spec allow multiple roles per user.

## Decision 5: Expose REST-style Worker endpoints for auth and admin management

- **Decision**: Use Astro API routes compiled into Worker handlers for login/logout and CRUD-style admin endpoints for users, roles, and permissions.
- **Rationale**: This fits the current project architecture, keeps the frontend and backend in one deployment unit, and provides clean integration points for admin pages and future clients.
- **Alternatives considered**:
  - RPC-style endpoints: rejected because REST-style endpoints were explicitly requested.
  - Move admin APIs to a separate Worker project: rejected because the current repository already uses Astro pages and Worker APIs together.

## Decision 6: Keep security event logging in Worker observability rather than expanding the required D1 schema

- **Decision**: Emit structured security events through the Worker’s observability/logging pipeline for login success, login failure, access denial, and role/permission changes instead of adding a new D1 audit table in this phase.
- **Rationale**: The feature spec requires security-relevant logging, while the implementation constraints named a specific D1 schema. Using observability logs satisfies the audit requirement without expanding the requested relational model.
- **Alternatives considered**:
  - Add a `security_events` D1 table: rejected for this phase because it exceeds the requested core schema and is not necessary for the first implementation.
  - Skip security logging: rejected because it would violate the feature spec.
