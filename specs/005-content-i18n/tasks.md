# Tasks: Multilingual Content Support

**Input**: Design documents from `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/content-i18n-api.yaml`, `quickstart.md`

**Tests**: No dedicated test-first tasks are included because the feature specification did not explicitly request TDD. Validation and regression checks are captured in the final polish phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the i18n implementation workspace and align execution with the approved design artifacts

- [X] T001 Review implementation targets in `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\plan.md`, `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\research.md`, and `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\quickstart.md`
- [X] T002 [P] Create the multilingual D1 migration scaffold in `D:\Projects\edge_cms\astro-blog-starter-template\migrations\0003_content_i18n.sql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared multilingual storage, parsing, and route foundations that every story depends on

**CRITICAL**: No user story work should begin until this phase is complete

- [X] T003 Implement D1 schema changes and English backfill logic for `posts` in `D:\Projects\edge_cms\astro-blog-starter-template\migrations\0003_content_i18n.sql`
- [X] T004 Implement D1 schema changes and English backfill logic for `site_pages` in `D:\Projects\edge_cms\astro-blog-starter-template\migrations\0003_content_i18n.sql`
- [X] T005 Add shared language configuration, translation parsing, fallback resolution, and JSON stringify helpers in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T006 Refactor post and page record types plus read/write helpers for JSON-backed translatable fields in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T007 [P] Add localized admin DTOs and language-aware href generation in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T008 [P] Create the shared localized public route structure in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\[slug].astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\blog\[...slug].astro`

**Checkpoint**: Shared multilingual persistence, fallback logic, and language-prefixed routing scaffolds are ready for story-specific work

---

## Phase 3: User Story 1 - Manage Content In Multiple Languages (Priority: P1) MVP

**Goal**: Let admins create and edit post/page title and content in English and Vietnamese within one workflow

**Independent Test**: Create and edit one post and one page, enter English and Vietnamese title/content values, save, reopen, and confirm both language variants persist and reload correctly

### Implementation for User Story 1

- [X] T009 [P] [US1] Extend post form UI for multilingual title/content editing in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`
- [X] T010 [P] [US1] Extend page form UI for multilingual title/content editing in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`
- [X] T011 [US1] Update post form parsing and validation for translation objects in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T012 [US1] Update page form parsing and validation for translation objects in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T013 [US1] Update admin post create/update handling to accept multilingual payloads and preserve redirect behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts.ts` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts\[id].ts`
- [X] T014 [US1] Update admin page create/update handling to accept multilingual payloads and preserve redirect behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\pages.ts`
- [X] T015 [P] [US1] Load multilingual post detail values into the dedicated admin editor in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\new.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\posts\[id]\edit.astro`
- [X] T016 [P] [US1] Load multilingual page detail values into the dedicated admin editor in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\new.astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\admin\pages\[id]\edit.astro`

**Checkpoint**: User Story 1 should deliver multilingual post/page authoring in the admin dashboard

---

## Phase 4: User Story 2 - Read Content In The Selected Language (Priority: P2)

**Goal**: Render posts and pages from `/en/` and `/vi/` URLs using the requested language with English fallback

**Independent Test**: Visit a multilingual post and page under `/en/` and `/vi/`, confirm the requested language renders when present, and verify missing translations fall back to English without blank output

### Implementation for User Story 2

- [X] T017 [US2] Update post publishing read helpers to resolve localized fields by URL language in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T018 [US2] Update page publishing read helpers to resolve localized fields by URL language in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T019 [P] [US2] Implement localized blog post rendering with fallback behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\blog\[...slug].astro`
- [X] T020 [P] [US2] Implement localized page rendering with fallback behavior in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\[slug].astro`
- [X] T021 [US2] Align canonical post/page href generation and admin preview links with language-prefixed routes in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`, `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`
- [X] T022 [US2] Preserve backward-compatible handling for English-only content and missing localized routes in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\blog\[...slug].astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[slug].astro`

**Checkpoint**: User Story 2 should deliver localized public rendering with English fallback

---

## Phase 5: User Story 3 - Expand To Additional Languages Later (Priority: P3)

**Goal**: Make language support configurable so new languages can be added without redesigning the content structure

**Independent Test**: Add a new language to the supported-language configuration, confirm admin editors expose it, and verify records continue to read through English fallback until translations are supplied

### Implementation for User Story 3

- [X] T023 [US3] Extract supported-language metadata and default-language resolution into reusable configuration in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`
- [X] T024 [P] [US3] Refactor post admin language-switcher rendering to derive tabs/inputs from shared language configuration in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`
- [X] T025 [P] [US3] Refactor page admin language-switcher rendering to derive tabs/inputs from shared language configuration in `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PageForm.astro`
- [X] T026 [US3] Generalize localized route validation and fallback handling for future languages in `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\blog\[...slug].astro` and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\[lang]\[slug].astro`
- [X] T027 [US3] Return parsed translation objects and supported-language metadata from admin content helpers/endpoints in `D:\Projects\edge_cms\astro-blog-starter-template\src\lib\blog.ts`, `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts.ts`, and `D:\Projects\edge_cms\astro-blog-starter-template\src\pages\api\admin\posts\[id].ts`

**Checkpoint**: All user stories should now be independently functional, and future language growth should not require a schema redesign

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, contract alignment, and documentation cleanup across all stories

- [X] T028 [P] Reconcile the delivered implementation with `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\contracts\content-i18n-api.yaml`
- [X] T029 [P] Update rollout and validation guidance in `D:\Projects\edge_cms\astro-blog-starter-template\specs\005-content-i18n\quickstart.md` and `D:\Projects\edge_cms\astro-blog-starter-template\AGENTS.md`
- [X] T030 Run regression and validation with `npm test` and `npm run check` from `D:\Projects\edge_cms\astro-blog-starter-template\package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories
- **Phase 3: User Story 1**: Depends on Phase 2
- **Phase 4: User Story 2**: Depends on Phase 2 and should follow User Story 1 so localized authoring data already exists
- **Phase 5: User Story 3**: Depends on Phases 2 through 4 because it generalizes the completed two-language implementation for future expansion
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after foundational work and delivers the MVP multilingual admin authoring workflow
- **US2 (P2)**: Starts after foundational work, but should follow US1 so localized public routes read the new stored translation structure
- **US3 (P3)**: Starts after US1 and US2 because it turns the initial `en`/`vi` solution into a reusable extensibility pattern

### Within Each User Story

- Shared helper updates before page/API integration
- Form/UI updates before route wiring validation
- Read/write data shape changes before fallback and link cleanup
- Story validation before moving to the next priority

### Parallel Opportunities

- `T009` and `T010` can run in parallel once foundational helpers are ready
- `T015` and `T016` can run in parallel for post/page admin route wiring
- `T019` and `T020` can run in parallel for localized public routes
- `T024` and `T025` can run in parallel when generalizing the language switcher
- `T028` and `T029` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
# Once the shared translation helpers are in place, the admin forms can be updated together:
Task: "Extend the multilingual post form in src/components/admin/PostForm.astro"
Task: "Extend the multilingual page form in src/components/admin/PageForm.astro"
```

---

## Parallel Example: User Story 2

```bash
# After language-aware read helpers exist, the localized public routes can be built together:
Task: "Implement localized blog post rendering in src/pages/[lang]/blog/[...slug].astro"
Task: "Implement localized page rendering in src/pages/[lang]/[slug].astro"
```

---

## Parallel Example: User Story 3

```bash
# After the shared language config is extracted, both admin forms can consume it in parallel:
Task: "Refactor post language-switcher rendering in src/components/admin/PostForm.astro"
Task: "Refactor page language-switcher rendering in src/components/admin/PageForm.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational multilingual persistence and route groundwork
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm post/page create and edit flows store and reload English and Vietnamese title/content correctly
5. Demo the multilingual authoring workflow before adding public localized routes

### Incremental Delivery

1. Deliver migration, JSON parsing/stringify helpers, and language-prefixed route scaffolding
2. Deliver User Story 1 for multilingual admin authoring
3. Deliver User Story 2 for localized public rendering and fallback behavior
4. Deliver User Story 3 for future language extensibility
5. Finish with contract reconciliation, documentation, and regression validation

### Parallel Team Strategy

1. One teammate owns D1 migration and shared translation helpers in `src/lib/blog.ts`
2. One teammate owns multilingual admin forms and admin route wiring
3. One teammate owns localized public routes and fallback rendering
4. One teammate owns extensibility cleanup, contract alignment, and validation

---

## Notes

- Tasks marked `[P]` target separate files or can proceed once a shared dependency is complete
- Story labels map directly to the three user stories in `spec.md`
- The suggested MVP scope is **User Story 1** because it delivers the core multilingual authoring value first
- All tasks follow the required checklist format with task ID, optional parallel marker, story label where required, and exact file path
