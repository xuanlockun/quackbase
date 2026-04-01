# Tasks: Dense Admin UI

**Input**: Design documents from `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/admin-ui-density.md`, `quickstart.md`

**Tests**: Automated tests are not explicitly required by the spec for this presentation-only feature. Validation tasks focus on `npm test`, `npm run build`, and manual route checks defined in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature workspace and execution references before changing implementation files

- [X] T001 Review feature artifacts in `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\plan.md`, `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\research.md`, and `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared dense admin primitives that all stories depend on

**Critical**: No user story work should begin until these shared layout and styling primitives are updated

- [X] T002 Update shared admin shell, surface, button, notice, table, and form density primitives in `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css`
- [X] T003 Update the authenticated admin frame to remove max-width behavior and support the dense content column in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`
- [X] T004 [P] Align reusable posts table markup with the shared dense table primitives in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`
- [X] T005 [P] Align reusable post form markup with the shared dense form primitives in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`

**Checkpoint**: Shared dense admin primitives are ready for story-specific work

---

## Phase 3: User Story 1 - Scan More Content at Once (Priority: P1) MVP

**Goal**: Increase visible information density across core admin tables and forms without sacrificing readability

**Independent Test**: Open `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit`, `/admin/pages`, and `/admin/header` and confirm tables, forms, and feedback blocks show more actionable content above the fold with no overlap or clipping

### Implementation for User Story 1

- [X] T006 [P] [US1] Refine the posts list page spacing and action alignment in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`
- [X] T007 [US1] Replace roomy page-management wrappers and tighten page editor spacing in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`
- [X] T008 [US1] Tighten the site settings form layout and supporting copy spacing in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro`
- [X] T009 [US1] Update dense table and form expectations in `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\contracts\admin-ui-density.md` if implementation details require clarification during delivery

**Checkpoint**: User Story 1 should show denser content surfaces on the primary list and form routes

---

## Phase 4: User Story 2 - Work Within a Fixed Navigation Frame (Priority: P2)

**Goal**: Preserve a fixed-width left navigation rail while the content region uses the remaining available width across admin pages

**Independent Test**: Open supported admin routes, scroll the page, and verify the sidebar remains anchored on the left while the content region fills the remaining width without centered container constraints

### Implementation for User Story 2

- [X] T010 [US2] Refine the sidebar structure and copy density for a fixed-width admin rail in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`
- [X] T011 [P] [US2] Update permission-catalog page structure to rely on the full-width admin frame instead of card stacks in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\permissions.astro`
- [X] T012 [P] [US2] Adjust any remaining admin page frame usage for dense full-width behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`

**Checkpoint**: User Story 2 should deliver a stable left rail and full-width content frame across supported admin routes

---

## Phase 5: User Story 3 - Use a Flat Professional Visual Style (Priority: P3)

**Goal**: Remove rounded, shadow-heavy, and card-style admin presentation in favor of a flat professional dashboard look

**Independent Test**: Review `/admin/roles`, `/admin/users`, and `/admin/permissions` and confirm grouped content uses borders, spacing, and alignment instead of rounded cards or raised surfaces

### Implementation for User Story 3

- [X] T013 [US3] Replace rounded panel, card, button, and badge treatments with flat dense styles in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleEditor.astro`
- [X] T014 [US3] Replace rounded panel, table, button, and badge treatments with flat dense styles in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserRoleTable.astro`
- [X] T015 [P] [US3] Remove remaining card-style admin utility wrappers from shared classes in `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css`

**Checkpoint**: User Story 3 should complete the flat professional visual pass across secondary admin tools

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the dense admin UI across stories and finalize documentation

- [X] T016 [P] Run regression checks for admin behavior with `npm test` from `D:\Projects\edge_cms\astro-blog-starter-template\package.json`
- [X] T017 [P] Run production build validation with `npm run build` from `D:\Projects\edge_cms\astro-blog-starter-template\package.json`
- [X] T018 Validate the route checklist in `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\quickstart.md` and record any follow-up notes in `D:\Projects\edge_cms\astro-blog-starter-template\specs\003-dense-admin-ui\tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: User Story 1**: Depends on Phase 2
- **Phase 4: User Story 2**: Depends on Phase 2 and can proceed after the shared frame updates are in place
- **Phase 5: User Story 3**: Depends on Phase 2 and should follow once shared flat styling primitives exist
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work and delivers the MVP dense content surfaces
- **US2 (P2)**: Starts after foundational work and can be validated independently once the sidebar and page frame updates land
- **US3 (P3)**: Starts after foundational work and completes the flat visual styling across remaining admin components

### Within Each User Story

- Shared CSS and layout primitives come before page-specific or component-specific refinements
- Page markup updates come before final route validation
- Visual cleanup comes before full regression and build validation

### Parallel Opportunities

- `T004` and `T005` can run in parallel after `T002` and `T003`
- `T006` and `T008` can run in parallel within US1 after the foundational phase
- `T011` and `T012` can run in parallel within US2 after `T010`
- `T013`, `T014`, and `T015` can run in parallel within US3 once the flat shared primitives are stable
- `T016` and `T017` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# After shared dense primitives are ready, these story tasks can run together:
Task: "Refine the posts list page spacing and action alignment in src/pages/admin/posts.astro"
Task: "Tighten the site settings form layout and supporting copy spacing in src/pages/admin/header.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational shared admin density primitives
3. Complete Phase 3: User Story 1
4. Validate `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]/edit`, `/admin/pages`, and `/admin/header`
5. Stop for review if the dense-content MVP meets expectations

### Incremental Delivery

1. Deliver shared dense primitives and core content-surface density improvements
2. Extend the dense frame across sidebar-driven navigation pages
3. Finish the flat professional styling pass on roles, users, and permission catalog
4. Run regression, build, and manual route validation

### Parallel Team Strategy

1. One person updates shared admin CSS and layout primitives
2. One person handles US1 page surfaces after the shared primitives land
3. One person handles secondary admin components for US3 once the flat style direction is fixed

---

## Notes

- Tasks marked `[P]` target different files or can proceed once a shared dependency is complete
- Story labels map directly to the three user stories in `spec.md`
- The suggested MVP scope is **User Story 1** because it delivers the densest value on the primary admin work surfaces first
- All tasks follow the required checklist format with task ID, optional parallel marker, story label where required, and exact file path
- Validation completed on 2026-04-01: `npm test` passed and `npm run build` passed after the dense admin UI implementation updates.
