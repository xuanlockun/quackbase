# Tasks: Dynamic Form UI

**Input**: Design documents from `D:/Projects/edge_cms/astro-blog-starter-template/specs/008-dynamic-form-ui/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/dynamic-form-ui.yaml`

**Tests**: Include contract and integration coverage for admin field configuration, shared language switch behavior, dynamic frontend rendering, submission validation, and regression safety because the plan and quickstart explicitly require `npm test` and `npm run check` validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare migration and test scaffolding for the shared UI and dynamic form system.

- [X] T001 Create the dynamic form migration scaffold in `D:/Projects/edge_cms/astro-blog-starter-template/migrations/0005_dynamic_form_ui.sql`
- [X] T002 Create the dynamic form contract test file in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/dynamic-form-ui-contract.spec.ts`
- [X] T003 Create the dynamic form integration test file in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/dynamic-form-ui-routes.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the D1 schema, form helper layer, and shared language switch foundation used by every story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement the D1 migration for `form_fields` and `form_submissions` in `D:/Projects/edge_cms/astro-blog-starter-template/migrations/0005_dynamic_form_ui.sql`
- [X] T005 [P] Add shared form field, label parsing, ordering, and submission validation helpers in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/forms.ts`
- [X] T006 Extend language utilities with shared switch-target and localized-label fallback helpers in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/i18n.ts`
- [X] T007 Update page-section content helpers to load and expose dynamic contact form configuration where needed in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T008 Create the reusable shared language switch component in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/LanguageSwitch.astro`
- [X] T009 [P] Add baseline contract assertions for dynamic form field payloads and submission payloads in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/dynamic-form-ui-contract.spec.ts`
- [X] T010 [P] Add baseline integration coverage for loading localized pages with dynamic contact configuration in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/dynamic-form-ui-routes.spec.ts`

**Checkpoint**: Shared D1 persistence, label fallback, and reusable language-switch infrastructure are ready for story implementation.

---

## Phase 3: User Story 1 - Configure Dynamic Contact Forms In Admin (Priority: P1) 🎯 MVP

**Goal**: Let admins create, localize, reorder, and persist dynamic contact form fields from the admin experience.

**Independent Test**: Open the admin interface for page/contact configuration, add text, email, and textarea fields with English and Vietnamese labels, reorder them, save, and verify the configuration reloads in the same order.

### Tests for User Story 1

- [X] T011 [P] [US1] Add contract coverage for admin form-field load and save responses in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/dynamic-form-ui-contract.spec.ts`
- [X] T012 [P] [US1] Add integration coverage for admin field creation, reorder, and reload behavior in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/dynamic-form-ui-routes.spec.ts`

### Implementation for User Story 1

- [X] T013 [US1] Implement the RBAC-protected admin field configuration API in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/api/admin/form-fields.ts`
- [X] T014 [P] [US1] Extend admin page form data loading to include dynamic contact field configuration in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/admin/pages/[id]/edit.astro`
- [X] T015 [P] [US1] Add dynamic contact field defaults, hidden JSON state, and submission wiring in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PageForm.astro`
- [X] T016 [US1] Add admin UI controls for multilingual labels, supported field types, required state, and reorder actions in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PageForm.astro`
- [X] T017 [US1] Normalize and persist saved field order and multilingual labels through shared form helpers in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/forms.ts`
- [X] T018 [P] [US1] Update admin header or page-level editing entry points to surface the contact form configuration workflow consistently in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/admin/header.astro`

**Checkpoint**: Admins can fully manage multilingual dynamic contact fields without code changes.

---

## Phase 4: User Story 2 - Experience A Consistent Frontend UI (Priority: P2)

**Goal**: Reuse the same language switch across admin and frontend while improving the banner and contact section presentation.

**Independent Test**: Visit the frontend on desktop and mobile, compare the client language switch against the admin switch, and verify the banner and contact section use the updated clean layout with improved spacing and hierarchy.

### Tests for User Story 2

- [X] T019 [P] [US2] Add contract assertions for shared language switch targets and fallback behavior in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/dynamic-form-ui-contract.spec.ts`
- [X] T020 [P] [US2] Add integration coverage for consistent frontend and admin language switch rendering and route changes in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/dynamic-form-ui-routes.spec.ts`

### Implementation for User Story 2

- [X] T021 [US2] Replace frontend header language-switch markup with the shared component in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/Header.astro`
- [X] T022 [US2] Replace admin sidebar language-switch markup with the shared component in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/Sidebar.astro`
- [X] T023 [P] [US2] Extract the refreshed banner presentation into `D:/Projects/edge_cms/astro-blog-starter-template/src/components/BannerSection.astro`
- [X] T024 [US2] Refactor page-section rendering to use the extracted banner component and cleaner contact section layout in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/CmsPageSections.astro`
- [X] T025 [P] [US2] Update shared Bootstrap-aligned spacing and minimal visual treatment for the language switch, banner, and contact area in `D:/Projects/edge_cms/astro-blog-starter-template/src/styles/global.css`

**Checkpoint**: The frontend and admin now share one language switch pattern, and banner/contact presentation is visually consistent.

---

## Phase 5: User Story 3 - Submit Dynamic Contact Forms In The Selected Language (Priority: P3)

**Goal**: Render the configured form in the active language, apply English fallback when needed, and store valid submissions in D1.

**Independent Test**: Configure a multilingual contact form in admin, open it in English and Vietnamese on the frontend, confirm labels switch correctly, submit responses, and verify the submission is accepted.

### Tests for User Story 3

- [X] T026 [P] [US3] Add contract coverage for public dynamic form submission success and validation failures in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/dynamic-form-ui-contract.spec.ts`
- [X] T027 [P] [US3] Add integration coverage for localized field rendering, English fallback, and successful submission storage in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/dynamic-form-ui-routes.spec.ts`

### Implementation for User Story 3

- [X] T028 [US3] Create the public dynamic contact form renderer with Bootstrap-minimal field layouts in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/DynamicForm.astro`
- [X] T029 [US3] Implement the public submission endpoint for configured field validation and persistence in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/api/forms/contact.ts`
- [X] T030 [US3] Add submission persistence and required-field validation against configured fields in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/forms.ts`
- [X] T031 [US3] Update page-section rendering to fetch configured fields and render the dynamic form in the active language in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/CmsPageSections.astro`
- [X] T032 [P] [US3] Update localized page routes to provide the active language and submission context expected by the dynamic form in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/[lang]/[slug].astro`

**Checkpoint**: Visitors can use the admin-configured contact form in either language and submit responses successfully.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, refresh repo context, and run regression validation across all stories.

- [X] T033 [P] Update dynamic form validation notes if implementation details changed in `D:/Projects/edge_cms/astro-blog-starter-template/specs/008-dynamic-form-ui/quickstart.md`
- [X] T034 Update agent context and feature notes for dynamic form UI in `D:/Projects/edge_cms/astro-blog-starter-template/AGENTS.md`
- [X] T035 Run full regression validation for dynamic form UI with `npm test` and `npm run check` from `D:/Projects/edge_cms/astro-blog-starter-template`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses the shared language-switch foundation.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and uses the admin configuration workflow established in User Story 1.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can be delivered first as the MVP once the shared D1 and i18n helpers are complete.
- **US2 (P2)**: Builds on the shared language-switch component from Phase 2 but remains independently testable from the UI consistency perspective.
- **US3 (P3)**: Depends on the dynamic field configuration introduced in US1 and consumes the contact-section presentation updates from US2.

### Within Each User Story

- Tests should be written before or alongside implementation and must cover the story’s independent test path.
- Shared helper or API updates come before UI wiring that consumes them.
- Page-section rendering changes come after the reusable component and data contracts are stable.
- Each story should be validated independently before moving to the next priority.

### Parallel Opportunities

- `T005`, `T006`, `T008`, `T009`, and `T010` can run in parallel once the migration scaffold exists.
- `T014`, `T015`, and `T018` can run in parallel within US1 after the admin API shape is defined.
- `T023` and `T025` can run in parallel within US2 while shared language-switch adoption proceeds in `Header.astro` and `Sidebar.astro`.
- `T026` and `T027` can run in parallel within US3 while the dynamic form component and submission endpoint are being implemented.

---

## Parallel Example: User Story 1

```bash
# Run US1 test coverage tasks together:
Task: "Add contract coverage for admin form-field load and save responses in tests/contract/dynamic-form-ui-contract.spec.ts"
Task: "Add integration coverage for admin field creation, reorder, and reload behavior in tests/integration/dynamic-form-ui-routes.spec.ts"

# Run US1 admin wiring tasks together after the API contract is stable:
Task: "Extend admin page form data loading to include dynamic contact field configuration in src/pages/admin/pages/[id]/edit.astro"
Task: "Add dynamic contact field defaults, hidden JSON state, and submission wiring in src/components/admin/PageForm.astro"
Task: "Update admin header or page-level editing entry points to surface the contact form configuration workflow consistently in src/pages/admin/header.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate admin dynamic field creation, localization, reorder, and persistence independently.
5. Demo the editor-facing form builder workflow before moving to frontend polish and public submission.

### Incremental Delivery

1. Finish Setup + Foundational to establish D1 persistence, label fallback, and the shared language switch.
2. Deliver US1 so admins can configure multilingual dynamic contact fields.
3. Deliver US2 so the frontend banner, contact area, and language switching become visually consistent.
4. Deliver US3 so visitors can render and submit the configured form in the selected language.
5. Finish Polish with documentation refresh and full regression validation.

### Parallel Team Strategy

1. One developer handles migration and shared helper work in Phase 2.
2. After Phase 2, one developer can focus on the admin configuration workflow in US1 while another prepares banner and shared switch component adoption for US2.
3. Once US1 is stable, public rendering and submission work in US3 can proceed alongside final styling and regression coverage.

---

## Notes

- `[P]` tasks target different files and avoid incomplete-task dependencies.
- `[US1]`, `[US2]`, and `[US3]` labels map directly to the stories in `spec.md`.
- The suggested MVP scope is **User Story 1**.
- Keep the dynamic form system lightweight by treating one contact form configuration as the supported editing surface rather than expanding to a full form-builder product.
