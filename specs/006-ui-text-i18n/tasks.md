# Tasks: UI Translation Coverage

**Input**: Design documents from `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-i18n-contract.yaml`, `quickstart.md`

**Tests**: No dedicated test-first tasks are included because the feature specification did not explicitly request TDD. Validation and regression checks are captured in the final polish phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the UI i18n workspace and align implementation with the approved design artifacts

- [X] T001 Review implementation targets in `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\plan.md`, `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\research.md`, and `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\quickstart.md`
- [X] T002 [P] Create the locale dictionary scaffolds in `D:\Projects\edge_cms\astro-blog-starter-template\locales\en.json` and `D:\Projects\edge_cms\astro-blog-starter-template\locales\vi.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared language resolution, dictionary loading, and translation helper infrastructure that all stories depend on

**CRITICAL**: No user story work should begin until this phase is complete

- [X] T003 Extend shared language metadata and validation for UI language selection in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts`
- [X] T004 Implement locale dictionary loading and nested key lookup helpers in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts`
- [X] T005 Implement the shared `t(key)` helper with English fallback behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts`
- [X] T006 Add request-level interface language resolution for route prefix and saved preference inputs in `D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts`
- [X] T007 [P] Seed the English source dictionary keys for shared navigation, actions, labels, and headings in `D:\Projects\edge_cms\astro-blog-starter-template\locales\en.json`
- [X] T008 [P] Seed the Vietnamese dictionary entries for shared navigation, actions, labels, and headings in `D:\Projects\edge_cms\astro-blog-starter-template\locales\vi.json`

**Checkpoint**: Shared UI translation loading, fallback logic, and request language resolution are ready for story-specific adoption

---

## Phase 3: User Story 1 - Use The Interface In A Preferred Language (Priority: P1) MVP

**Goal**: Show shared frontend and admin UI text in English or Vietnamese based on the selected language

**Independent Test**: Open supported frontend pages and admin screens in English and Vietnamese and confirm navigation labels, button text, labels, and headings display in the selected language

### Implementation for User Story 1

- [X] T009 [P] [US1] Replace shared frontend header and footer text with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\Header.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\Footer.astro`
- [X] T010 [P] [US1] Replace public page and blog layout headings or action text with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\BlogPost.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\index.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\CmsPageSections.astro`
- [X] T011 [P] [US1] Replace admin sidebar navigation and session labels with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`
- [X] T012 [P] [US1] Replace admin post and page list headings, buttons, and empty-state copy with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro`
- [X] T013 [P] [US1] Replace admin form action buttons, labels, and headings for posts and pages with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\new.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\[id]\edit.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\new.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\[id]\edit.astro`
- [X] T014 [US1] Replace remaining shared admin role and user management headings, buttons, and labels with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\roles.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\users.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleForm.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserForm.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro`
- [X] T015 [US1] Replace shared admin header/settings labels and action text with translation keys in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\header.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`

**Checkpoint**: User Story 1 should deliver translated UI copy across the supported frontend and admin screens

---

## Phase 4: User Story 2 - Keep Language Selection Consistent Across Navigation (Priority: P2)

**Goal**: Preserve the selected interface language across supported frontend and admin navigation flows

**Independent Test**: Select English or Vietnamese through URL context or saved preference, navigate across supported frontend and admin screens, and confirm the interface language remains consistent

### Implementation for User Story 2

- [X] T016 [US2] Implement saved language preference read/write helpers for UI language selection in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts`
- [X] T017 [US2] Propagate resolved UI language through request locals and layout/component props in `D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts`, `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\BlogPost.astro`
- [X] T018 [P] [US2] Align frontend route rendering to use URL-prefixed language context on `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\[slug].astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\blog\[...slug].astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[slug].astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\blog\[...slug].astro`
- [X] T019 [P] [US2] Preserve interface language across admin navigation links and redirects in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\rbac\policies.ts`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts`
- [X] T020 [US2] Add or wire a language selection control that updates preference and respects current route context in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\Header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`, or `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`
- [X] T021 [US2] Ensure unsupported or missing saved preferences fall back safely to English during navigation in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts` and `D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts`

**Checkpoint**: User Story 2 should deliver stable language persistence across supported routes and navigation

---

## Phase 5: User Story 3 - Safely Expand UI Translation Coverage Over Time (Priority: P3)

**Goal**: Make the UI translation system scalable so new screens and languages can be added without redesigning the translation model

**Independent Test**: Add a new language dictionary in a staging environment, wire it into the supported language configuration, and confirm screens continue to resolve keys with English fallback

### Implementation for User Story 3

- [X] T022 [US3] Refactor locale dictionary structure and helper types for future-language extensibility in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts`
- [X] T023 [P] [US3] Normalize shared translation key organization for navigation, actions, labels, and headings in `D:\Projects\edge_cms\astro-blog-starter-template\locales\en.json` and `D:\Projects\edge_cms\astro-blog-starter-template\locales\vi.json`
- [X] T024 [P] [US3] Update shared frontend components to consume stable semantic translation keys rather than English literals in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\Header.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\Footer.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\CmsPageSections.astro`
- [X] T025 [P] [US3] Update shared admin components to consume stable semantic translation keys rather than screen-specific literals in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageTable.astro`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\RoleTable.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\UserTable.astro`
- [X] T026 [US3] Generalize language-aware UI rendering hooks so additional supported languages can be activated without route rewrites in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\i18n.ts` and `D:\Projects\edge_cms\astro-blog-starter-template\src\middleware.ts`
- [X] T027 [US3] Reconcile the delivered helper behavior with `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\contracts\ui-i18n-contract.yaml`

**Checkpoint**: All user stories should now be independently functional, and future UI translation growth should not require a redesign

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, regression coverage, and documentation cleanup across all stories

- [X] T028 [P] Update rollout and validation guidance in `D:\Projects\edge_cms\astro-blog-starter-template\specs\006-ui-text-i18n\quickstart.md` and `D:\Projects\edge_cms\astro-blog-starter-template\AGENTS.md`
- [X] T029 [P] Add or update regression coverage for UI language resolution and route behavior in `D:\Projects\edge_cms\astro-blog-starter-template\tests\contract\ui-i18n-contract.spec.ts` and `D:\Projects\edge_cms\astro-blog-starter-template\tests\integration\ui-i18n-routes.spec.ts`
- [X] T030 Run regression and validation with `npm test` and `npm run check` from `D:\Projects\edge_cms\astro-blog-starter-template\package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: User Story 1**: Depends on Phase 2
- **Phase 4: User Story 2**: Depends on Phase 2 and should follow User Story 1 so translated UI copy already exists on supported screens
- **Phase 5: User Story 3**: Depends on Phases 2 through 4 because it generalizes the completed two-language solution for future growth
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work and delivers the MVP translated UI experience
- **US2 (P2)**: Starts after foundational work, but should follow US1 so language persistence can be validated against translated screens
- **US3 (P3)**: Starts after US1 and US2 because it turns the initial `en`/`vi` solution into a scalable long-term pattern

### Within Each User Story

- Shared helper updates before route or layout propagation
- Dictionary and key structure updates before broad component replacement
- Screen-level translation adoption before language persistence validation
- Story validation before moving to the next priority

### Parallel Opportunities

- `T007` and `T008` can run in parallel once helper structure is defined
- `T009`, `T010`, `T011`, `T012`, and `T013` can run in parallel for separate UI surfaces in User Story 1
- `T018` and `T019` can run in parallel for frontend and admin navigation flows
- `T023`, `T024`, and `T025` can run in parallel when normalizing semantic keys and consuming them in shared components
- `T028` and `T029` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# Once the shared t(key) helper and dictionaries are in place, UI surfaces can be translated together:
Task: "Replace shared frontend header/footer text in src/components/Header.astro and src/components/Footer.astro"
Task: "Replace admin sidebar navigation text in src/components/admin/Sidebar.astro"
Task: "Replace admin post/page list text in src/pages/admin/posts.astro, src/pages/admin/pages.astro, src/components/admin/PostTable.astro, and src/components/admin/PageTable.astro"
```

---

## Parallel Example: User Story 2

```bash
# After request language resolution is available, route and admin navigation work can proceed together:
Task: "Align frontend route rendering to use URL-prefixed language context in src/pages/[lang]/[slug].astro and src/pages/[lang]/blog/[...slug].astro"
Task: "Preserve interface language across admin navigation links in src/components/admin/Sidebar.astro and src/middleware.ts"
```

---

## Parallel Example: User Story 3

```bash
# Once the translation key model is stabilized, dictionaries and shared consumers can be generalized together:
Task: "Normalize translation key organization in locales/en.json and locales/vi.json"
Task: "Update shared frontend components to consume semantic keys in src/components/Header.astro, src/components/Footer.astro, and src/components/CmsPageSections.astro"
Task: "Update shared admin components to consume semantic keys in src/components/admin/Sidebar.astro and table components"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational UI i18n helpers and dictionary groundwork
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm supported frontend and admin screens show English and Vietnamese UI text correctly
5. Demo the translated interface before adding language persistence refinements

### Incremental Delivery

1. Deliver locale files, helper loading, and fallback infrastructure
2. Deliver User Story 1 for translated frontend and admin UI copy
3. Deliver User Story 2 for consistent language persistence across navigation
4. Deliver User Story 3 for future language extensibility and semantic key cleanup
5. Finish with regression coverage, documentation, and full validation

### Parallel Team Strategy

1. One teammate owns `src/lib/i18n.ts`, middleware, and dictionary loading
2. One teammate owns frontend translated UI adoption
3. One teammate owns admin translated UI adoption and navigation persistence
4. One teammate owns semantic key cleanup, contract reconciliation, and validation

---

## Notes

- Tasks marked `[P]` target separate files or can proceed once a shared dependency is complete
- Story labels map directly to the three user stories in `spec.md`
- The suggested MVP scope is **User Story 1** because it delivers visible translated UI value first
- All tasks follow the required checklist format with task ID, optional parallel marker, story label where required, and exact file path
