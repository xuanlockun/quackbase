---

description: "Task list template for feature implementation"
---

# Tasks: Admin builder table UX

**Input**: Design documents from `/specs/011-admin-builder/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- [P] = Task can run in parallel (diff files/no dependency)  
- [Story] = Maps to user story (US1, US2, US3). Setup/foundational/polish tasks omit story label.  
- Include exact file paths in descriptions.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align tooling, drag/drop helper, and styles before story work begins.

- [ ] T001 Document the new admin builder workflow in `specs/011-admin-builder/plan.md` and confirm drag-and-drop goals (no story label)
- [ ] T002 Add the chosen drag-and-drop helper dependency to `frontend/package.json` and run `npm install` to lock it before touching UI files (no story label)
- [ ] T003 [P] Update `frontend/src/styles/admin.css` to enforce compact Bootstrap table spacing and remove bulky helper-copy styles used in the existing builder screens (no story label)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide shared backend persistence and drag/drop helpers that every story requires.

- [ ] T004 [P] Extend `backend/src/lib/admin.ts` to accept ordered arrays for sections, form fields, and navigation items, ensuring saves normalize order based on array index (no story label)
- [ ] T005 [P] Create `frontend/src/components/admin/builder/drag-utils.ts` to expose a consistent handler for SortableJS (or native) reorder events and to emit normalized arrays (no story label)
- [ ] T006 [P] Build `frontend/src/components/admin/builder/table-layout.astro` (or TSX) to wrap admin tables with the shared dense structure, drag handle slot, and remove/add buttons so each story reuses it (no story label)

---

## Phase 3: User Story 1 - Page section table and drag reorder (Priority: P1) 🎯 MVP

**Goal**: Replace the checkbox/order inputs with a table that adds/removes sections via explicit actions and reorders them through drag handles while persisting the new order.

**Independent Test**: Add/remove sections and drag rows in the builder, save, and verify only added sections remain in the persisted `sections` array with the same order on reload.

- [ ] T007 [US1] Implement `frontend/src/components/admin/builder/sections.tsx` to render active sections rows with section type, controls, drag handle, and remove action using the shared table layout
- [ ] T008 [US1] Wire the drag utility to `sections.tsx` so moving a row updates the in-memory array order, triggers a save through the shared admin API, and updates the D1 storage order (order = array index)
- [ ] T009 [US1] Add the explicit “Add section” control in `sections.tsx` that appends a new row and persists it, ensuring removed rows disappear from the stored array

---

## Phase 4: User Story 2 - Contact form field table (Priority: P2)

**Goal**: Manage contact form fields in a dense table with drag-and-drop ordering, localized labels, required toggles, and explicit add/remove actions.

**Independent Test**: Create fields with localized labels and required toggles, reorder via drag handle, save, and confirm the `formFields` array retains the toggles, labels, and new order on reload.

- [ ] T010 [P] [US2] Build `frontend/src/components/admin/builder/contact-form.tsx` rows that surface field type selectors, localized label inputs, required toggles, drag handles, and remove buttons inside the shared table layout
- [ ] T011 [US2] Hook the drag utility to the contact form table so dragging rearranges the `formFields` array and triggers the backend save to persist the new order (array index = sort)
- [ ] T012 [US2] Ensure `formFields` saves include the localized label JSON and required flags by reusing the backend helper in `backend/src/lib/admin.ts` (from T004) within the contact form save path

---

## Phase 5: User Story 3 - Navigation item reordering (Priority: P3)

**Goal**: Keep the existing navigation row UI but add drag handles so ordering can be updated via drag-and-drop before persisting to D1.

**Independent Test**: Drag navigation rows, save, and confirm navigation items load in the same order without extra helper text appearing.

- [ ] T013 [US3] Update `frontend/src/components/admin/builder/navigation.tsx` to render each row with a drag handle from the shared layout while keeping the “Add row” behavior intact
- [ ] T014 [US3] Connect the drag utility to `navigation.tsx` so reordering updates the `navigationItems` array before calling the shared save API and persists the new order

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Finish helper-copy cleanup, documentation, and validation across all builder tables.

- [ ] T015 [P] Simplify the helper copy and verbose descriptions in all admin builder screens (sections, contact form, navigation) so only essential titles or short descriptions remain
- [ ] T016 [P] Update `specs/011-admin-builder/quickstart.md` and `specs/011-admin-builder/contracts/admin-ui.md` if any implementation details shifted during story work, and mention how drag-and-drop persistence works
- [ ] T017 [P] Run `npm run lint` and `npm test` to confirm the UI changes pass existing checks before signing off

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – start immediately.  
- **Foundational (Phase 2)**: Depends on Setup completion; blocks user stories until the shared helpers and backend changes exist.  
- **User Stories (Phases 3-5)**: Depend on Foundational phase and can run in priority order or in parallel once the foundation is ready.  
- **Polish (Final Phase)**: Depends on all stories completing.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational phase and does not depend on other stories.  
- **US2 (P2)**: Starts after Foundation; can run parallel to US1 once shared helpers exist.  
- **US3 (P3)**: Starts after Foundation; independent but may reuse shared table layout from US1/US2.

### Parallel Opportunities

- Phase 1 tasks marked [P] can run simultaneously.  
- All Phase 2 tasks can run in parallel since they touch separate files (`admin.ts`, `drag-utils.ts`, `table-layout.astro`).  
- Phases 3-5 stories can proceed concurrently once foundational pieces exist.  
- Phase N tasks are all marked [P] for final polishing and documentation.

### MVP Suggestion

Implement Phase 3 (US1) first, validate drag-and-drop persistence for sections, and then add Phase 4 + Phase 5 once US1 is stable. Phase N polish completes last.
