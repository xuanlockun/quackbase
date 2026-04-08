# Tasks: Admin Builder UX Tables

**Input**: Design documents from `/specs/012-admin-builder-refactor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-ordering.md, quickstart.md

**Tests**: Not explicitly requested; focus on UI behavior and persistence flows.

**Organization**: Tasks arranged by user story so each phase can be implemented and verified independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blockers).  
- **[Story]**: Which user story this task belongs to (US1, US2, US3).  
- Always mention exact file paths.

## Phase 1: Setup (Shared UI experience)

**Purpose**: Prepare the shared styling and utility helpers for the upcoming drag-and-drop tables.

- [ ] T001 [P] Add compact table layout rules, drag-handle styles, and dense spacing tokens for the admin builder into `src/styles/global.css`.
- [ ] T002 [P] Create `src/lib/ui-table-order.ts` (or similar) with helpers that serialize ordered row data, compute new order indexes after drag operations, and expose them to the page sections, contact fields, and navigation scripts.

---

## Phase 2: Foundational (Data normalization)

**Purpose**: Ensure the backend accepts the new ordered arrays as truth and normalizes order without relying on manual numeric inputs.

- [ ] T003 Update `src/lib/blog.ts` to treat `pageSectionsConfig` as the canonical ordered array coming from the editor, use the shared helper to normalize order, and drop the legacy checkbox + manual order fallbacks in `parsePageSectionsForm`.
- [ ] T004 Update `src/lib/forms.ts` so that `parseFormFieldsForm`, `parseFormFieldsPayload`, and `normalizeFormFields` derive `order` solely from the uploaded array order (using the new helper), guaranteeing `contactFormFields` is stored in D1 by array position.

---

## Phase 3: User Story 1 - Manage page sections via table (Priority: P1) 🎯 MVP

**Goal**: Replace the checkbox/manual order combo with a drag-and-drop table and explicit add/remove actions for page sections.

**Independent Test**: Add, reorder with drag handles, and remove sections from `/src/components/admin/PageForm.astro` while watching `pageSectionsConfig` update and verify only the active sections persist after saving.

- [ ] T005 [US1] Rewrite the page sections markup in `src/components/admin/PageForm.astro` so the active catalog is rendered as rows inside the table, each showing the section type, a section-specific description, a drag handle, and a remove button, and add the explicit “Add section” button that appends a row.
- [ ] T006 [US1] Implement the corresponding script in `src/components/admin/PageForm.astro` to hydrate the table rows from `initialSections`, wire the drag-handle reorder events, update the `data-page-sections-config` hidden field, and ensure removing a row deletes the section from the ordered payload.

---

## Phase 4: User Story 2 - Manage contact form fields with the drag-and-drop table (Priority: P2)

**Goal**: Replace the standalone order input with a row-based editor that keeps localized labels, the required toggle, and drag handles in sync.

**Independent Test**: Add a contact field, update localized labels and the required toggle, reorder it via drag handles, and verify `contactFormFields` payload reorders without manual numeric inputs.

- [ ] T007 [US2] Rebuild the contact form fields editor in `src/components/admin/PageForm.astro` so each field shows the type selector, localized label inputs (EN/VI), required toggle, drag handle, and remove action inside a compact table, and ensure the “Add field” action appends a new row.
- [ ] T008 [US2] Extend the `PageForm.astro` script to monitor row order, compute the new array positions after drag/drop, and write the normalized list (with labels and required flag) to the `data-contact-fields-payload` hidden input while keeping the empty state logic.

---

## Phase 5: User Story 3 - Reorder navigation + simplify helper copy (Priority: P3)

**Goal**: Keep the existing navigation table while adding drag handles and trimming verbose helper text like `contentAndAccessManagement`.

**Independent Test**: Drag navigation rows in `src/pages/admin/header.astro`, confirm the hidden `navItems` payload reflects the new sequence, and verify helper copy above the table now only shows a short title.

- [ ] T009 [US3] Update the navigation table markup in `src/pages/admin/header.astro` so rows include a drag handle column, concise helper copy/titles, and minimal helper text (remove verbose paragraphs) while retaining add/remove buttons.
- [ ] T010 [US3] Enhance the `header.astro` script to wire drag-and-drop ordering (using the shared helper), keep payload updates in sync with the row order, and ensure remove/add actions continue working without numeric inputs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish up documentation and validation steps after implementation.

- [ ] T011 Review `specs/012-admin-builder-refactor/quickstart.md` and cross-check the quickstart flow against the new tables, then run `npm run lint` (and `npm test` if quickstart recommends it) to verify existing regression coverage.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; establishes shared visuals/logic.
- **Foundational (Phase 2)**: Depends on Phase 1 so the backend matches the new payload shape.
- **User Stories (Phases 3–5)**: Each depends on Phase 2 completion; they can be worked in priority order (US1 → US2 → US3) or in parallel once Foundation is ready.
- **Polish (Phase 6)**: Depends on all user stories finishing to validate the experience.

### User Story Dependencies

- **User Story 1 (P1)**: Blocks the MVP/primary drag-and-drop sections table.
- **User Story 2 (P2)**: Can start once US1 and the shared helper exist (reuses the same utilities).
- **User Story 3 (P3)**: Independent but benefits from the shared helper and CSS updates.

### Within Each Story

- Models/serializers (tools/helpers) before page scripts  
- Scripts before verifying persistence  
- Each story’s tasks should leave it independently testable before moving to the next priority.

## Parallel Opportunities

- T001 and T002 (Setup) can run in parallel since they touch CSS and utility helpers independently.  
- T005/T006, T007/T008, T009/T010 target different UI sections and can be assigned to different developers once the foundation is ready.  
- The polish task (T011) can run concurrently with the latter story tasks for sanity checks.

## Implementation Strategy

### MVP First (US1 only)

1. Finish Phase 1 + Phase 2 to set up shared drag-and-drop helpers and data normalization.  
2. Complete Phase 3 (US1) so page sections can be added/reordered via the table.  
3. Validate: add/reorder/remove sections in the admin builder and confirm D1 persists the ordered array.  
4. Deploy/demo the refreshed sections panel if ready.

### Incremental Delivery

1. After MVP, implement US2 (contact form fields) using the same helpers.  
2. Next, implement US3 (navigation ordering and simplified copy).  
3. Run the tasks in Phase 6 to confirm documentation and lint pass.

### Parallel Team Strategy

1. Split work: one developer handles US1, another handles US2, and a third implements US3 once the helpers/Styles (Phase 1) are in place.  
2. Reuse `src/lib/ui-table-order.ts` helpers across stories for consistent ordering logic.  
3. Polish and validation can happen while final story reviews are under way.
