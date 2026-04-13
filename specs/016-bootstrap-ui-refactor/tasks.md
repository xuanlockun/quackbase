# Tasks: Bootstrap UI Standardization

**Input**: Design documents from `/specs/016-bootstrap-ui-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the shared Bootstrap CDN bundle and ensure the base layouts load it before any component markup.

- [X] T001 Update `src/components/BaseHead.astro` to inject the Bootstrap 5.3.8 CDN `<link>` and `<script>` (with the provided integrity/crossorigin attributes) so every route pulls the same styles/JS before custom CSS.
- [X] T002 Remove the local `import "bootstrap/dist/css/bootstrap.min.css";` from `src/layouts/AdminLayout.astro` and rely solely on `BaseHead.astro` for the stylesheet so the admin shell also uses the CDN bundle.
- [X] T003 Confirm both admin and public layouts include `BaseHead.astro` and that no other files import Bootstrap; document the remaining custom UI selectors that still need migrating in `specs/016-bootstrap-ui-refactor/spec.md` (audit reference).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Replace the sprawling custom CSS with minimal brand overrides and prepare shared scripts for the new Bootstrap markup.

- [X] T004 Rework `src/styles/global.css` to strip `.admin-*`, `.dynamic-*`, `.prose`, and layout-specific selectors, keeping only brand color variables/gradients and any utilities that cannot be expressed with Bootstrap classes.
- [X] T005 Update `src/components/DynamicForm.astro` and the banner slider script to rely on Bootstrap-friendly data attributes/selectors (e.g., add `.form-control` classes, adjust `[data-dynamic-contact-form]` hooks) so their behavior survives the markup change.
- [X] T006 Create a short migration notes doc in `specs/016-bootstrap-ui-refactor/` summarizing which selectors/components still need refactoring before story work begins (use this as the checklist for subsequent phases).

---

## Phase 3: User Story 1 - Admin shell with consistent Bootstrap layout (Priority: P1)

**Goal**: Every admin screen uses Bootstrap containers/rows, nav/offcanvas, tables, badges, and form controls while retaining RBAC, session, and action scripts.

**Independent Test**: Navigate the admin posts, pages, roles, and users flows; confirm layout uses Bootstrap containers/navs, tables use Bootstrap `table`/`table-hover`, forms use `form-control`/`form-check`, and all action buttons share `btn` styles without breaking CRUD behavior.

- [X] T007 [US1] Refactor `src/layouts/AdminLayout.astro` to wrap the shell in Bootstrap containers/rows, replace the sidebar toggle with Bootstrap collapse/offcanvas markup, and restyle the top bar with Bootstrap navs/buttons.
- [X] T008 [US1] Rebuild `src/components/admin/Sidebar.astro` using Bootstrap nav/pills, badges, and icon spacing so active states align with Bootstrap utilities while preserving the existing RBAC link generation.
- [X] T009 [US1] Convert admin tables and forms (`src/components/admin/PostTable.astro`, `PageTable.astro`, `UserTable.astro`, `RoleTable.astro`, `LanguageTable.astro`, `PostForm.astro`, `PageForm.astro`, `UserForm.astro`, `RoleForm.astro`, `LanguageForm.astro`, `PermissionBadge.astro`, `RoleEditor.astro`) to Bootstrap tables (`table`, `table-striped`), badges (`badge`), cards, and form controls, ensuring inline actions and status chips use consistent `btn`/`badge` classes.

---

## Phase 4: User Story 2 - Public site with Bootstrap containers (Priority: P2)

**Goal**: The header, blog post layout, banner/cart columns, and contact form render with Bootstrap `navbar`, `container`/`row`/`col`, `card`, and form utilities while preserving hero images, feeds, and dynamic content.

**Independent Test**: Load the home page and a blog post; verify the header uses Bootstrap navbar/sticky spacing, the blog content sits inside Bootstrap containers with proper typography spacing, the card grids use `.card`, and the contact form inputs/buttons are `form-control`/`btn`.

- [X] T010 [US2] Rebuild `src/components/Header.astro` (and `HeaderLink.astro`) into a Bootstrap `navbar` with responsive `container`/`row` logic and ensure active link styling uses Bootstrap utilities instead of custom underlines.
- [X] T011 [US2] Update `src/layouts/BlogPost.astro` so hero, title, date, and content sit inside Bootstrap containers/features; use `card` classes for the title section, move typography into Bootstrap spacing helpers, and ensure `<main>` uses `container`/`row`.
- [X] T012 [US2] Refactor `src/components/CmsPageSections.astro`, `BannerSection.astro`, and the contact form area so dynamic sections leverage Bootstrap `card`, `carousel`/`grid`, spacing utilities, and form controls while keeping the AJAX form logic unchanged.

---

## Phase 5: User Story 3 - Language switch and dynamic interactions (Priority: P3)

**Goal**: Language switcher, profile dropdown, and contact form interactions continue to work inside Bootstrap dropdown/collapse markup while retaining translation behavior and accessibility.

**Independent Test**: Toggle languages, open the admin profile dropdown, collapse/expand the sidebar (if still a collapse), and submit the contact form; all interactions must remain functional with the new Bootstrap markup and CSS classes.

- [X] T013 [US3] Reimplement `src/components/LanguageSwitch.astro` as a Bootstrap button group/dropdown that highlights the active language with `btn`/`active` styles while still calling the translation link helpers.
- [X] T014 [US3] Update the admin profile dropdown and language controls (in `src/layouts/AdminLayout.astro`) so they use Bootstrap dropdown markup (`data-bs-toggle="dropdown"`) and focus the right aria attributes without breaking the logout form.
- [X] T015 [US3] Ensure the contact form (`src/components/DynamicForm.astro`) fields use Bootstrap validation helper classes and that status messaging (`data-contact-form-status`) uses Bootstrap `alert` classes so AJAX feedback looks consistent.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, documentation updates, and responsive checks across all stories.

- [X] T016 [P] Review the entire admin and public UI in multiple breakpoints (desktop/tablet/mobile) to confirm Bootstrap spacing/responsiveness works, recording any remaining layout gaps that require follow-up.
- [X] T017 [P] Update documentation (e.g., `README.md` or specs notes) to mention the Bootstrap dependency, the CDN source, and the completed audit; ensure `specs/016-bootstrap-ui-refactor/quickstart.md` reflects the implemented tasks.
- [X] T018 [P] Run `npm run lint` and `npm test` (or the documented smoke checks) to confirm nothing regressed after the UI refactor.

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: Bootstrap asset loading and audit must finish before reworking global styles/scripts.
- **Phase 2 → Phases 3-5**: Admin, public, and interaction-focused stories depend on removing old CSS and preparing Bootstrap-compatible scripts.
- **User Story order**: US1 (admin) is highest priority (P1) and serves as the MVP; US2 and US3 can start after Phase 2 and run in parallel if desired.
- **Polish → all prior phases**: Final polishing waits until every story is functionally complete.

## Parallel Opportunities

- Tasks T007-T009 (admin layout, sidebar, forms/tables) can be split among team members because they touch different files—mark them parallelizable if staff allows.
- Tasks T010-T012 (public header, blog layout, dynamic sections) and T013-T015 (language and interactions) can run in parallel once foundational work is ready.
- Phase 6 tasks (T016-T018) are explicitly marked [P] and can run concurrently once each story reaches stabilization.

## Implementation Strategy

1. **MVP First**: Complete Phase 1 and Phase 2, then deliver US1 (Phase 3) to ship the bootstrap-styled admin shell and prove the new layout works.
2. **Incremental Delivery**: After validating US1 independently, deliver US2, then US3, verifying each story’s independent test before moving to the next.
3. **Parallel Work**: Once Thomas ensures Phase 2 is complete, different team members can tackle admin (US1), public (US2), and interaction (US3) phases concurrently.

## Summary

- **Total task count**: 18
- **Tasks per story**: US1 = 3, US2 = 3, US3 = 3
- **Parallel opportunities**: admin/public/interaction story groups and final polish tasks are parallelizable.
- **Independent tests**: Each story has its own described independent test steps (admin navigation, public layout, dynamic interactions).
- **Suggested MVP scope**: Finish US1 (Phase 3) after foundational work, then extend with US2 and US3 in subsequent iterations.
