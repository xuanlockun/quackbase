# Tasks: Admin CRUD Layout Refactor

**Input**: Design documents from `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/admin-crud-ui.md`, `quickstart.md`

**Tests**: No dedicated test-first tasks are included because the feature specification did not explicitly request TDD. Validation and regression checks are captured in the final polish phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the admin CRUD refactor workspace and align implementation targets with the design artifacts

- [X] T001 Review feature artifacts in `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\plan.md`, `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\research.md`, and `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\quickstart.md`
- [X] T002 [P] Add the Bootstrap dependency and wire shared admin imports in `D:\Projects\edge_cms\astro-blog-starter-template\package.json`, `D:\Projects\edge_cms\astro-blog-starter-template\package-lock.json`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared admin shell and reusable foundations required by every entity workflow

**CRITICAL**: No user story work should begin until this phase is complete

- [X] T003 Refactor the shared admin shell to a Bootstrap sidebar-plus-content layout in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`
- [X] T004 [P] Rework admin sidebar structure and active-link styling for the new layout in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`
- [X] T005 [P] Replace admin-specific layout and surface rules with Bootstrap-aligned shared styles in `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css`
- [X] T006 [P] Add shared route helpers and record-loading support for id-based page editing in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T007 [P] Create reusable page CRUD components in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`
- [X] T008 [P] Create reusable user CRUD components in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserForm.astro`
- [X] T009 [P] Create reusable role CRUD components in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleForm.astro`

**Checkpoint**: Shared admin layout, styling, and reusable entity components are ready for story-specific route work

---

## Phase 3: User Story 1 - Focused Entity List Management (Priority: P1) MVP

**Goal**: Show `pages`, `users`, and `roles` list routes as clean list-focused management screens with no inline create or edit workflows

**Independent Test**: Open `/admin/pages`, `/admin/users`, and `/admin/roles` and confirm each page renders only list-oriented management content, status feedback, and row actions without embedded create/edit panels

### Implementation for User Story 1

- [X] T010 [US1] Rebuild the pages list route around `AdminLayout` and `PageTable` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`
- [X] T011 [US1] Rebuild the users list route around `AdminLayout` and `UserTable` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`
- [X] T012 [US1] Rebuild the roles list route around `AdminLayout` and `RoleTable` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`
- [X] T013 [P] [US1] Update list-route create and edit navigation targets in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro`
- [X] T014 [US1] Remove inline create/edit behavior and client-side panel toggles from the legacy admin components in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserRoleTable.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleEditor.astro`

**Checkpoint**: User Story 1 should deliver route-focused list pages for all three entities

---

## Phase 4: User Story 2 - Dedicated Create Workflows (Priority: P2)

**Goal**: Provide dedicated `/new` routes for pages, users, and roles with shared form components and clear Back navigation

**Independent Test**: From each list page, select Create, confirm navigation to `/new`, verify a single create form renders, and use the Back control to return to the corresponding list page

### Implementation for User Story 2

- [X] T015 [P] [US2] Create the dedicated pages create route using `PageForm` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\new.astro`
- [X] T016 [P] [US2] Create the dedicated users create route using `UserForm` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users\new.astro`
- [X] T017 [P] [US2] Create the dedicated roles create route using `RoleForm` in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles\new.astro`
- [X] T018 [US2] Adapt page create submission and redirect behavior for the dedicated create route in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages.ts`
- [X] T019 [US2] Adapt user create submission behavior for the dedicated create route in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\users.ts`
- [X] T020 [US2] Adapt role create submission behavior for the dedicated create route in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\roles.ts`

**Checkpoint**: User Story 2 should deliver dedicated create pages for all three entities

---

## Phase 5: User Story 3 - Dedicated Edit Workflows In A Full-Width Admin Layout (Priority: P3)

**Goal**: Provide dedicated `/:id/edit` routes for pages, users, and roles while keeping the shared sidebar and full-width content workspace consistent across all CRUD screens

**Independent Test**: From each list page, select Edit, confirm navigation to the matching `/:id/edit` route, verify the selected record loads in a dedicated form with a Back control, and confirm missing or inaccessible records preserve a clear return path to the list page

### Implementation for User Story 3

- [X] T021 [P] [US3] Create the dedicated pages edit route with id-based loading and missing-record handling in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\[id]\edit.astro`
- [X] T022 [P] [US3] Create the dedicated users edit route with record loading and Back navigation in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users\[id]\edit.astro`
- [X] T023 [P] [US3] Create the dedicated roles edit route with record loading and Back navigation in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles\[id]\edit.astro`
- [X] T024 [US3] Adapt page update and error redirect behavior for id-based edit routes in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages.ts` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages\delete.ts`
- [X] T025 [US3] Adapt user update handling for route-based editing in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\users\[userId].ts`
- [X] T026 [US3] Adapt role update and delete handling for route-based editing in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\roles\[roleId].ts`
- [X] T027 [US3] Align admin index and shared navigation entry points with the completed CRUD route structure in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\index.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\rbac\policies.ts`

**Checkpoint**: All user stories should now be independently functional with consistent full-width admin layout behavior

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation alignment, and cleanup across all stories

- [X] T028 [P] Update implementation notes and route expectations in `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\quickstart.md` and `D:\Projects\edge_cms\astro-blog-starter-template\README.md`
- [X] T029 [P] Reconcile the final delivered CRUD UI with `D:\Projects\edge_cms\astro-blog-starter-template\specs\004-admin-crud-layout\contracts\admin-crud-ui.md`
- [X] T030 Run regression and build validation with `npm test` and `npm run check` from `D:\Projects\edge_cms\astro-blog-starter-template\package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: User Story 1**: Depends on Phase 2
- **Phase 4: User Story 2**: Depends on Phase 2 and benefits from the list routes completed in User Story 1
- **Phase 5: User Story 3**: Depends on Phase 2 and reuses the shared form and route patterns established in User Story 2
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work and delivers the MVP list-only admin workflow
- **US2 (P2)**: Starts after foundational work, but should follow US1 so the Create entry points come from stable list pages
- **US3 (P3)**: Starts after foundational work, but should follow US2 because the edit routes reuse the dedicated per-entity forms and route conventions

### Within Each User Story

- Shared components before route assembly
- Route assembly before mutation and redirect cleanup
- Navigation cleanup after route files exist
- Story validation before moving to the next priority

### Parallel Opportunities

- `T002` can run in parallel with `T001`
- `T004` through `T009` can run in parallel after `T003` begins, as long as the write scopes stay separate
- `T010`, `T011`, and `T012` can run in parallel once foundational components are ready
- `T015`, `T016`, and `T017` can run in parallel for the dedicated create routes
- `T021`, `T022`, and `T023` can run in parallel for the dedicated edit routes
- `T028` and `T029` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# After foundational shared components are ready, these list routes can be built together:
Task: "Rebuild the pages list route in src/pages/admin/pages.astro"
Task: "Rebuild the users list route in src/pages/admin/users.astro"
Task: "Rebuild the roles list route in src/pages/admin/roles.astro"
```

---

## Parallel Example: User Story 2

```bash
# Once the shared forms exist, the dedicated create routes can be assembled in parallel:
Task: "Create the pages create route in src/pages/admin/pages/new.astro"
Task: "Create the users create route in src/pages/admin/users/new.astro"
Task: "Create the roles create route in src/pages/admin/roles/new.astro"
```

---

## Parallel Example: User Story 3

```bash
# After create-route patterns are stable, the edit routes can be implemented in parallel:
Task: "Create the pages edit route in src/pages/admin/pages/[id]/edit.astro"
Task: "Create the users edit route in src/pages/admin/users/[id]/edit.astro"
Task: "Create the roles edit route in src/pages/admin/roles/[id]/edit.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational shared layout and component work
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm `/admin/pages`, `/admin/users`, and `/admin/roles` are list-only screens with clean navigation
5. Demo the standardized list workflow before expanding into create and edit routes

### Incremental Delivery

1. Deliver shared admin shell and reusable entity component foundations
2. Deliver User Story 1 for route-focused list management
3. Deliver User Story 2 for dedicated create routes
4. Deliver User Story 3 for dedicated edit routes and full-width layout consistency
5. Finish with documentation and validation

### Parallel Team Strategy

1. One teammate owns `AdminLayout`, sidebar, and shared Bootstrap styling
2. One teammate owns page CRUD components and routes
3. One teammate owns user CRUD components and routes
4. One teammate owns role CRUD components and routes
5. API redirect and mutation cleanup merges after route structure is stable

---

## Notes

- Tasks marked `[P]` target different files or can proceed once a shared dependency is complete
- Story labels map directly to the three user stories in `spec.md`
- The suggested MVP scope is **User Story 1** because it delivers the core CRUD decluttering value first
- All tasks follow the required checklist format with task ID, optional parallel marker, story label where required, and exact file path
