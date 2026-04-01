# Tasks: Admin UI Refactor

**Input**: Design documents from `/specs/002-admin-ui-refactor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No dedicated test-first tasks are included because the feature specification did not explicitly request TDD. Validation and regression checks are captured in the final polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project paths are used from the repository root, matching the implementation plan structure.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the admin refactor workspace and shared file structure

- [X] T001 Create the shared admin route folders and component targets in `src/layouts/AdminLayout.astro`, `src/components/admin/Sidebar.astro`, `src/components/admin/PostTable.astro`, `src/components/admin/PostForm.astro`, `src/pages/admin/posts/new.astro`, and `src/pages/admin/posts/[id]/edit.astro`
- [X] T002 [P] Add shared admin-shell style tokens and layout rules for the refactor in `src/styles/global.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement the reusable authenticated admin shell in `src/layouts/AdminLayout.astro`
- [X] T004 [P] Refactor navigation into the dedicated sidebar component in `src/components/admin/Sidebar.astro` and update `src/components/AdminNav.astro` to compose or delegate to it
- [X] T005 [P] Add API read helpers and response shaping for admin post list/detail data in `src/lib/blog.ts`
- [X] T006 [P] Extend the admin posts API contract implementation for list/create responses in `src/pages/api/admin/posts.ts`
- [X] T007 [P] Add the admin post detail API route for fetch and update operations in `src/pages/api/admin/posts/[id].ts`
- [X] T008 Normalize delete redirect and response behavior for the page-based workflow in `src/pages/api/admin/posts/delete.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Focused Post List Management (Priority: P1) MVP

**Goal**: Show `/admin/posts` as a clean posts-table page with sidebar navigation and no inline editor

**Independent Test**: Open `/admin/posts` and confirm the page shows only the posts table, status feedback, and row actions without any embedded create or edit form

### Implementation for User Story 1

- [X] T009 [P] [US1] Build the reusable posts table component for row rendering and action links in `src/components/admin/PostTable.astro`
- [X] T010 [US1] Rebuild the posts list page around `AdminLayout` and `PostTable` in `src/pages/admin/posts.astro`
- [X] T011 [US1] Update admin navigation defaults and visible post-management links for the new page-oriented workflow in `src/lib/rbac/policies.ts` and `src/pages/admin/index.astro`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Dedicated Post Creation Flow (Priority: P2)

**Goal**: Provide a dedicated `/admin/posts/new` page with one shared post form and a back action

**Independent Test**: From `/admin/posts`, select `Create Post`, confirm navigation to `/admin/posts/new`, verify the single primary form renders, and use the back action to return to the list

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement the reusable create/edit post form component in `src/components/admin/PostForm.astro`
- [X] T013 [US2] Create the dedicated post creation page using `AdminLayout` and `PostForm` in `src/pages/admin/posts/new.astro`
- [X] T014 [US2] Update create-post submission handling and success/error routing for the dedicated create page in `src/pages/api/admin/posts.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Dedicated Post Editing Flow (Priority: P3)

**Goal**: Provide a dedicated `/admin/posts/:id/edit` page with loaded post data, shared form reuse, and clear recovery for missing posts

**Independent Test**: From `/admin/posts`, select `Edit Post`, confirm navigation to `/admin/posts/{id}/edit`, verify the form loads the selected post, and verify missing ids show a clear back-to-list outcome

### Implementation for User Story 3

- [X] T015 [US3] Implement the dedicated post edit page with API-backed post loading and missing-post handling in `src/pages/admin/posts/[id]/edit.astro`
- [X] T016 [US3] Finalize edit-post submission behavior and permission-aware update handling in `src/pages/api/admin/posts/[id].ts`
- [X] T017 [US3] Update row-level edit links and view-state messaging for the dedicated edit route in `src/components/admin/PostTable.astro` and `src/pages/admin/posts.astro`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T018 [P] Align remaining admin pages to the shared admin layout shell where the refactor touches them in `src/pages/admin/header.astro`, `src/pages/admin/pages.astro`, `src/pages/admin/permissions.astro`, `src/pages/admin/roles.astro`, and `src/pages/admin/users.astro`
- [X] T019 [P] Update implementation-facing documentation for the refactored post workflow in `specs/002-admin-ui-refactor/quickstart.md` and `README.md`
- [X] T020 Run end-to-end validation for the refactor with `npm test` and `npm run check`, then fix any resulting issues in `tests/integration/admin-auth-rbac.spec.ts` and affected `src/pages/admin/*` files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and benefits from User Story 1 list navigation being in place
- **User Story 3 (Phase 5)**: Depends on Foundational completion and reuses the shared form from User Story 2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2), but should follow User Story 1 so the create entry point is wired from the completed list page
- **User Story 3 (P3)**: Can start after Foundational (Phase 2), but should follow User Story 2 because it reuses the same shared `PostForm`

### Within Each User Story

- Shared shell and API prerequisites before page wiring
- Reusable components before route assembly
- Route implementation before cross-page messaging cleanup
- Story validation before moving to the next priority

### Parallel Opportunities

- `T002`, `T004`, `T005`, `T006`, and `T007` can run in parallel after the initial file scaffold exists
- `T009` can proceed in parallel with `T011` once foundational tasks are complete
- `T018` and `T019` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# Launch the reusable table work and navigation wiring together after Phase 2:
Task: "Build the reusable posts table component in src/components/admin/PostTable.astro"
Task: "Update admin navigation defaults and visible post-management links in src/lib/rbac/policies.ts and src/pages/admin/index.astro"
```

---

## Parallel Example: User Story 2

```bash
# Build the shared form while preparing the dedicated create route:
Task: "Implement the reusable create/edit post form component in src/components/admin/PostForm.astro"
Task: "Create the dedicated post creation page in src/pages/admin/posts/new.astro"
```

---

## Parallel Example: Foundational Phase

```bash
# Run API and layout groundwork in parallel after setup:
Task: "Refactor navigation into the dedicated sidebar component in src/components/admin/Sidebar.astro and src/components/AdminNav.astro"
Task: "Add API read helpers and response shaping in src/lib/blog.ts"
Task: "Extend admin posts API responses in src/pages/api/admin/posts.ts"
Task: "Add the admin post detail API route in src/pages/api/admin/posts/[id].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm `/admin/posts` is a clean table-only screen with sidebar navigation
5. Demo or review the decluttered posts-management workflow before expanding into create/edit routes

### Incremental Delivery

1. Complete Setup + Foundational -> shared admin shell and API foundation ready
2. Add User Story 1 -> validate the table-only posts list
3. Add User Story 2 -> validate dedicated creation flow
4. Add User Story 3 -> validate dedicated editing flow and missing-post handling
5. Finish with cross-cutting polish and repo-wide validation

### Parallel Team Strategy

1. One teammate completes `AdminLayout` and sidebar foundation
2. One teammate prepares API list/detail support in `src/lib/blog.ts` and `src/pages/api/admin/posts*`
3. After foundation, one teammate owns `PostTable` plus `/admin/posts`, while another builds `PostForm` plus `/admin/posts/new`
4. The edit route work follows once the shared form is merged

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map tasks to the specific user stories for traceability
- Each user story remains independently verifiable from the routes and behaviors defined in `spec.md`
- Keep permission behavior unchanged unless a task explicitly calls for route-aware visibility or redirects
- Prefer route-driven navigation and shared components over restoring query-param or inline-editor behavior
