# Tasks: Admin Authentication RBAC

**Input**: Design documents from `/specs/001-admin-auth-rbac/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include targeted integration and API contract validation tasks because the implementation plan and quickstart explicitly require them.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Astro application paths live under `src/`, `migrations/`, and `tests/` at the repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies, environment typing, and validation scaffolding for the RBAC migration

- [x] T001 Add Worker-compatible JWT and auth dependencies in D:\Projects\edge_cms\astro-blog-starter-template\package.json
- [x] T002 [P] Declare JWT secret and D1 runtime bindings for admin auth in D:\Projects\edge_cms\astro-blog-starter-template\src\env.d.ts
- [x] T003 [P] Create API contract validation scaffolding for admin RBAC endpoints in D:\Projects\edge_cms\astro-blog-starter-template\tests\contract\admin-rbac-api.spec.ts
- [x] T004 [P] Create integration test scaffolding for admin auth and permission flows in D:\Projects\edge_cms\astro-blog-starter-template\tests\integration\admin-auth-rbac.spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth, RBAC, persistence, and middleware infrastructure that MUST be complete before any user story work

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create the D1 auth and RBAC schema plus seed data in D:\Projects\edge_cms\astro-blog-starter-template\migrations\0002_admin_auth_rbac.sql
- [x] T006 [P] Add shared admin auth cookie helpers in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\auth\cookies.ts
- [x] T007 [P] Add JWT signing and verification helpers for Worker runtime in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\auth\jwt.ts
- [x] T008 [P] Add bcrypt password hashing and verification helpers in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\auth\passwords.ts
- [x] T009 Add session resolution utilities that load the signed-in admin user from D1 in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\auth\session.ts
- [x] T010 [P] Add admin user D1 queries and mapping helpers in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\db\admin-users.ts
- [x] T011 [P] Add role and role-assignment D1 queries in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\db\roles.ts
- [x] T012 [P] Add permission catalog and effective-permission D1 queries in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\db\permissions.ts
- [x] T013 [P] Add RBAC permission constants and catalog helpers in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\rbac\permissions.ts
- [x] T014 [P] Add shared permission policy definitions for admin areas and actions in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\rbac\policies.ts
- [x] T015 Add page and API guard helpers for authentication and authorization in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\rbac\guards.ts
- [x] T016 Add structured security event logging helpers for auth and RBAC actions in D:\Projects\edge_cms\astro-blog-starter-template\src\lib\auth\audit.ts
- [x] T017 Replace shared-token route protection with admin middleware in D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts
- [x] T018 Remove legacy token-auth helpers from D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order or in parallel if staffed

---

## Phase 3: User Story 1 - Secure Admin Access (Priority: P1) MVP

**Goal**: Require admin users to authenticate with email and password before they can reach protected `/admin` routes

**Independent Test**: Verify unauthenticated requests to `/admin` redirect to `/admin/login`, successful email/password login sets the session cookie and reaches `/admin`, and authenticated users with no admin role are redirected away from protected admin pages

### Tests for User Story 1

- [x] T019 [P] [US1] Add login/logout API contract coverage in D:\Projects\edge_cms\astro-blog-starter-template\tests\contract\admin-rbac-api.spec.ts
- [x] T020 [P] [US1] Add authentication redirect and sign-in integration coverage in D:\Projects\edge_cms\astro-blog-starter-template\tests\integration\admin-auth-rbac.spec.ts

### Implementation for User Story 1

- [x] T021 [US1] Replace token-based login API with email/password authentication in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\auth\login.ts
- [x] T022 [P] [US1] Implement authenticated logout cookie clearing in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\auth\logout.ts
- [x] T023 [US1] Replace the token sign-in form with email/password login UX in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\login.astro
- [x] T024 [US1] Update the admin landing page redirect to the new authenticated dashboard flow in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\index.astro
- [x] T025 [US1] Add session-aware admin route rendering and unauthorized redirect handling in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro
- [x] T026 [P] [US1] Add session-aware admin route rendering and unauthorized redirect handling in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro
- [x] T027 [P] [US1] Add session-aware admin route rendering and unauthorized redirect handling in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro

**Checkpoint**: User Story 1 should now secure the admin surface and allow only authenticated admins to enter it

---

## Phase 4: User Story 2 - Role-Based Admin Experience (Priority: P2)

**Goal**: Enforce permission-based access for editorial users and hide restricted admin controls from unauthorized roles

**Independent Test**: Verify an editor can reach content-management screens, cannot reach role or permission management pages, and cannot execute restricted admin API actions without the required permission

### Tests for User Story 2

- [x] T028 [P] [US2] Add permission-denial contract coverage for users, roles, and permissions endpoints in D:\Projects\edge_cms\astro-blog-starter-template\tests\contract\admin-rbac-api.spec.ts
- [x] T029 [P] [US2] Add editor-versus-superadmin authorization integration coverage in D:\Projects\edge_cms\astro-blog-starter-template\tests\integration\admin-auth-rbac.spec.ts

### Implementation for User Story 2

- [x] T030 [US2] Enforce permission checks for post-management actions in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts.ts
- [x] T031 [P] [US2] Enforce permission checks for post deletion in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts\delete.ts
- [x] T032 [P] [US2] Enforce permission checks for page-management actions in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages.ts
- [x] T033 [P] [US2] Enforce permission checks for page deletion in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages\delete.ts
- [x] T034 [P] [US2] Enforce permission checks for site settings updates in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\site.ts
- [x] T035 [US2] Update admin navigation to render links from effective permissions in D:\Projects\edge_cms\astro-blog-starter-template\src\components\AdminNav.astro
- [x] T036 [P] [US2] Add reusable permission-aware role badges for admin views in D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PermissionBadge.astro

**Checkpoint**: User Story 2 should now preserve editorial workflows while preventing unauthorized access to restricted screens and actions

---

## Phase 5: User Story 3 - Superadmin Role Governance (Priority: P3)

**Goal**: Let superadmins manage users, roles, and permission assignments through protected API endpoints and admin pages

**Independent Test**: Verify a superadmin can create a role, update its permissions, assign it to a user, and see the user’s access change on the next protected request

### Tests for User Story 3

- [x] T037 [P] [US3] Add CRUD contract coverage for users, roles, and permissions endpoints in D:\Projects\edge_cms\astro-blog-starter-template\tests\contract\admin-rbac-api.spec.ts
- [x] T038 [P] [US3] Add superadmin role-management integration coverage in D:\Projects\edge_cms\astro-blog-starter-template\tests\integration\admin-auth-rbac.spec.ts

### Implementation for User Story 3

- [x] T039 [US3] Implement admin user listing and create/update handlers in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\users.ts
- [x] T040 [P] [US3] Implement role listing and create handlers in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\roles.ts
- [x] T041 [P] [US3] Implement role update and deletion handlers in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\roles\[roleId].ts
- [x] T042 [P] [US3] Implement permission catalog listing handler in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\permissions.ts
- [x] T043 [P] [US3] Build the user-role assignment table UI in D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserRoleTable.astro
- [x] T044 [P] [US3] Build the role editor UI for name and permission updates in D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleEditor.astro
- [x] T045 [US3] Build the superadmin user management page in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro
- [x] T046 [P] [US3] Build the superadmin role management page in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro
- [x] T047 [P] [US3] Build the superadmin permission catalog page in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\permissions.astro

**Checkpoint**: All user stories should now be independently functional, including dynamic RBAC administration by superadmins

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and end-to-end validation across the full admin RBAC feature

- [x] T048 [P] Document admin auth setup, seeded roles, and bootstrap steps in D:\Projects\edge_cms\astro-blog-starter-template\specs\001-admin-auth-rbac\quickstart.md
- [x] T049 Harden unauthorized error handling and redirect consistency across admin routes in D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts
- [x] T050 Run the end-to-end validation flow described for this feature in D:\Projects\edge_cms\astro-blog-starter-template\specs\001-admin-auth-rbac\quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion and defines the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion and builds on the authenticated admin surface from US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion and uses the auth and permission infrastructure established for US1 and US2
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and has no dependency on later stories
- **User Story 2 (P2)**: Starts after Foundational and should be validated against the authenticated flows from US1
- **User Story 3 (P3)**: Starts after Foundational and should reuse the same permission resolution path proven in US1 and US2

### Within Each User Story

- Contract and integration tests should be written before or alongside implementation and fail before the corresponding feature is completed
- D1/data helpers precede route handlers
- Route handlers precede Astro page wiring
- Shared UI components precede the pages that consume them

### Parallel Opportunities

- `T002`, `T003`, and `T004` can run in parallel during setup
- `T006` through `T014` can run in parallel after the migration shape in `T005` is settled
- In US1, `T022`, `T026`, and `T027` can proceed in parallel after session primitives are ready
- In US2, `T031` through `T034` and `T036` can proceed in parallel
- In US3, `T040` through `T044` and `T046` through `T047` can proceed in parallel once shared RBAC services exist

---

## Parallel Example: User Story 2

```bash
Task: "Enforce permission checks for post deletion in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts\delete.ts"
Task: "Enforce permission checks for page-management actions in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages.ts"
Task: "Enforce permission checks for page deletion in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages\delete.ts"
Task: "Enforce permission checks for site settings updates in D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\site.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate unauthenticated redirect, valid login, and no-role denial flows before expanding scope

### Incremental Delivery

1. Finish Setup and Foundational to establish the RBAC substrate
2. Deliver User Story 1 and validate secure admin entry
3. Deliver User Story 2 and validate editor-safe permissions
4. Deliver User Story 3 and validate superadmin governance flows
5. Finish with polish, observability checks, and quickstart validation

### Suggested MVP Scope

- Ship through **Phase 3 / User Story 1** first to secure `/admin` and replace the shared token model before adding superadmin management UI

---

## Notes

- All tasks follow the required checklist format with task IDs, optional parallel markers, story labels where required, and exact file paths
- `tests/` does not currently exist in the repository, so the listed test tasks also establish that validation structure
- The existing token-based endpoints under `src/pages/api/admin/login.ts` and `src/pages/api/admin/logout.ts` should be replaced by the new `src/pages/api/admin/auth/` route structure described in the contract
