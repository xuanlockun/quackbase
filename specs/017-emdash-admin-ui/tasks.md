# Tasks: Emdash-Inspired Admin UI Refactor

**Input**: Design documents from `/specs/017-emdash-admin-ui/`  
**Prerequisites**: `plan.md` and `spec.md`

**Scope**: Admin UI only. Do not change business logic, routes, RBAC policy, or backend behavior.

## Phase 1: Setup (Shared Baseline)

**Purpose**: Capture the current admin state and lock the verification routes that will be used throughout the refactor.

- [X] T001 [P] Document the current admin shell and CRUD baseline in `D:\Projects\edge_cms\astro-blog-starter-template\specs\017-emdash-admin-ui\quickstart.md` so the shell, list, form, and settings routes used for visual comparison are explicit.
- [X] T002 [P] Record the responsive verification matrix in `D:\Projects\edge_cms\astro-blog-starter-template\specs\017-emdash-admin-ui\quickstart.md` for desktop, tablet, and 375px-wide mobile checks across the admin screens.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared admin shell and global styling foundation that all later admin screens depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T003 [P] Refactor `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro` to establish the shared shell structure, tighter page canvas, and page-header contract used by every admin screen.
- [X] T004 [P] Rebuild `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro` so grouped navigation, active/current states, and offcanvas behavior read like a compact Emdash-style rail while preserving RBAC-driven visibility.
- [X] T005 [P] Reduce admin-specific custom styling in `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css` to a minimal set of shell density, spacing, and focus overrides that support the Bootstrap-first approach.
- [X] T006 [P] Align the top utility area in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro` so the language switch, profile menu, and shell actions feel part of one cohesive header row.
- [X] T007 Verify the shared shell across `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\index.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\languages.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\permissions.astro` at desktop and mobile widths before moving on.

**Checkpoint**: The admin shell should now feel structurally closer to Emdash across the main admin routes.

---

## Phase 3: User Story 1 - Persistent admin shell alignment (Priority: P1)

**Goal**: Make the admin shell consistently read as a single workspace with a deliberate sidebar, header, and page framing pattern.

**Independent Test**: Open the main admin screens on desktop and mobile and confirm the sidebar, top utility area, page header, and content frame remain visually consistent while still navigating to the same routes with the same permissions.

- [X] T008 [P] [US1] Tighten the page-header and shell-action composition in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro` so titles, descriptions, and action slots align like a unified workspace.
- [X] T009 [P] [US1] Refine grouped sidebar sections, spacing, hover states, focus states, and current-page emphasis in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`.
- [X] T010 [US1] Update shell spacing, full-height behavior, and content canvas width in `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css` so the admin frame feels denser and more intentional.
- [X] T011 [P] [US1] Verify the shell alignment on `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\index.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\languages.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\permissions.astro` across desktop and 375px-wide mobile.

**Checkpoint**: The shell should now feel visibly closer to Emdash and remain coherent across the main admin routes.

---

## Phase 4: User Story 2 - Cohesive CRUD surfaces (Priority: P1)

**Goal**: Make tables, cards, forms, badges, filters, and action bars feel like one system across the admin CRUD surfaces.

**Independent Test**: Visit representative CRUD screens for posts, pages, roles, users, and settings and verify that the same card density, table treatment, header hierarchy, action placement, and field spacing recur everywhere.

- [X] T012 [P] [US2] Standardize table density, header treatment, badge styles, and inline action hierarchy in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro`.
- [X] T013 [P] [US2] Rework the post and page editors in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro` so field groups, helper text, tabs, and actions share a common dense layout.
- [X] T014 [P] [US2] Rework the role and user editors in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleEditor.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PermissionBadge.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserRoleTable.astro` to match the same CRUD surface language.
- [X] T015 [P] [US2] Normalize page-level wrappers, notices, and action placement in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\new.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\[id]\edit.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\new.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\[id]\edit.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles\new.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles\[id]\edit.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users\new.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users\[id]\edit.astro`.
- [X] T016 [P] [US2] Verify posts, pages, roles, users, and settings surfaces for consistent density, empty states, and action hierarchy across the refactored CRUD screens.

**Checkpoint**: CRUD screens should now feel like a single cohesive admin system rather than a set of loosely related Bootstrap pages.

---

## Phase 5: User Story 3 - Responsive admin ergonomics (Priority: P2)

**Goal**: Keep the admin usable on tablet and mobile widths while preserving navigation, action access, and visual clarity.

**Independent Test**: Resize the admin UI down to mobile widths and confirm navigation, headers, tables, and forms remain readable, tappable, and free from broken layout behavior.

- [X] T017 [P] [US3] Tighten responsive behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css` so the offcanvas navigation, header stack, and content canvas behave cleanly on tablet and phone widths.
- [X] T018 [P] [US3] Update dense settings and translation screens in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\languages.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\languages\[locale].astro` so tables, toolbars, and inline actions remain usable on narrow screens.
- [X] T019 [P] [US3] Review hover, focus, and active feedback across `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\LanguageTable.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\LanguageForm.astro` so state cues remain obvious in compact layouts.
- [X] T020 [US3] Verify the full admin experience on desktop, tablet, and 375px-wide mobile in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\index.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\languages.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\permissions.astro`.

**Checkpoint**: The admin should remain usable and polished at narrow widths without losing the shell or action clarity.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final review, validation, and cleanup across all admin UI changes.

- [ ] T021 [P] Run `npm run lint` and `npm test` after the admin UI refactor to confirm the shell and CRUD updates did not introduce regressions.
- [X] T022 [P] Update `D:\Projects\edge_cms\astro-blog-starter-template\specs\017-emdash-admin-ui\quickstart.md` with the final verification notes and any screen-specific caveats discovered during review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No implementation dependencies. Establishes the verification baseline.
- **Phase 2**: Depends on Phase 1. Blocks all later admin UI work.
- **Phase 3**: Depends on Phase 2. Delivers the shell-alignment story first.
- **Phase 4**: Depends on Phase 2. Can begin after the shell foundation is stable and may run alongside Phase 3 once shell changes are in place.
- **Phase 5**: Depends on Phase 2. Tightens responsive behavior after the core shell and CRUD surfaces are stable.
- **Phase 6**: Depends on completion of the desired story phases.

### Story Dependencies

- **US1 (P1)**: Starts after the shared shell foundation is in place. No dependency on CRUD screen work.
- **US2 (P1)**: Starts after the shared shell foundation is in place. May reuse the shell changes from US1 but remains independently testable.
- **US3 (P2)**: Starts after the shared shell foundation is in place and focuses on mobile and compact-layout behavior.

### Within Each Story

- Shell changes before page-specific polish.
- Shared components before route wrappers.
- Visual verification after each story phase.

## Parallel Opportunities

- Tasks T001-T002 can run in parallel because they only update the verification baseline in `quickstart.md`.
- Tasks T003-T006 can be split across shell, sidebar, and global CSS work because they touch different files or isolated regions.
- Tasks T008-T010 can be split across layout, sidebar, and CSS work for the shell-alignment story.
- Tasks T012-T015 can be split across tables, forms, and route wrappers for the CRUD story.
- Tasks T017-T019 can be split across responsive shell, settings screens, and state-feedback review for the mobile story.
- Tasks T021-T022 can run in parallel once implementation is complete.

## Parallel Example: User Story 2

```text
Task: "Standardize table density, header treatment, badge styles, and inline action hierarchy in src/components/admin/PostTable.astro, src/components/admin/PageTable.astro, src/components/admin/RoleTable.astro, and src/components/admin/UserTable.astro"
Task: "Rework the post and page editors in src/components/admin/PostForm.astro and src/components/admin/PageForm.astro so field groups, helper text, tabs, and actions share a common dense layout"
Task: "Rework the role and user editors in src/components/admin/RoleForm.astro, src/components/admin/UserForm.astro, src/components/admin/RoleEditor.astro, src/components/admin/PermissionBadge.astro, and src/components/admin/UserRoleTable.astro to match the same CRUD surface language"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 to lock the verification baseline.
2. Complete Phase 2 to establish the shared admin shell and make the visible shell change.
3. Complete Phase 3 for the persistent admin shell alignment story.
4. Validate the shell independently before touching deeper CRUD surfaces.

### Incremental Delivery

1. Deliver the shell first so the biggest visual improvement lands early.
2. Add CRUD surface unification next so the admin feels cohesive across pages.
3. Finish with responsive polish and compact-layout cleanup.
4. Run final lint/test checks and capture the last review notes.

### Parallel Team Strategy

1. One teammate can own the shell and sidebar.
2. Another can work on CRUD tables and forms.
3. A third can focus on responsive polish and verification once the shared shell is stable.

## Summary

- **Total task count**: 22
- **Tasks per user story**: US1 = 4, US2 = 5, US3 = 4
- **Parallel opportunities**: Setup, shell, CRUD, responsive, and final validation work all include parallelizable tasks.
- **Independent tests**: Each story includes a verification task covering the specified admin routes and viewport behavior.
- **Suggested MVP scope**: Finish Phase 2 and Phase 3 first so the Emdash-like admin shell is visible before broader CRUD polish.
