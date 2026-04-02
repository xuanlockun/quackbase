# Tasks: Localized Post URLs

**Input**: Design documents from `D:/Projects/edge_cms/astro-blog-starter-template/specs/007-localized-post-urls/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/localized-post-routes.yaml`

**Tests**: Include contract and integration coverage for localized post payloads, route resolution, migration safety, and fallback behavior because the plan and quickstart explicitly require `npm test` and `npm run check` validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature scaffolding and test entry points for localized post URLs.

- [X] T001 Create the localized post migration scaffold in `D:/Projects/edge_cms/astro-blog-starter-template/migrations/0004_localized_post_urls.sql`
- [X] T002 Create the localized post contract test file in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/localized-post-contract.spec.ts`
- [X] T003 Create the localized post route integration test file in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/localized-post-routes.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared data parsing, migration, and route helper foundation that all stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Implement the D1 migration that converts legacy `posts.slug` and `posts.description` into English-keyed JSON in `D:/Projects/edge_cms/astro-blog-starter-template/migrations/0004_localized_post_urls.sql`
- [X] T005 [P] Extend localized text and slug normalization helpers for `slug` and `description` handling in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/i18n.ts`
- [X] T006 Update post persistence types, parsing, and JSON stringify/read logic for localized `slug`, `description`, `title`, and `content` in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T007 [P] Add shared post URL builder helpers for clean `/{lang}/{slug}` links and legacy compatibility decisions in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/i18n.ts`
- [X] T008 Update post list/detail helper outputs to expose localized slug maps, description maps, and clean view links in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T009 [P] Add baseline contract assertions for localized post payload schemas in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/localized-post-contract.spec.ts`

**Checkpoint**: Shared localized post persistence and URL helpers are ready for story implementation.

---

## Phase 3: User Story 1 - Publish Localized Posts With Clean URLs (Priority: P1) 🎯 MVP

**Goal**: Let editors create and update posts with per-language title, description, content, and slug values that produce clean localized post URLs.

**Independent Test**: Create a post with English and Vietnamese title, description, content, and slug values in the admin UI, save it, reopen it, and confirm both localized clean URLs are generated correctly from the stored post data.

### Tests for User Story 1

- [X] T010 [P] [US1] Add contract coverage for create/update post payloads with localized slug and description objects in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/localized-post-contract.spec.ts`
- [X] T011 [P] [US1] Add integration coverage for admin post form submission and localized edit reload behavior in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/localized-post-routes.spec.ts`

### Implementation for User Story 1

- [X] T012 [US1] Update admin post API validation and write handling for localized `slug` and `description` payloads in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/api/admin/posts.ts`
- [X] T013 [US1] Update admin post update handling for localized `slug` and `description` payloads in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/api/admin/posts/[id].ts`
- [X] T014 [P] [US1] Extend post form field defaults and submission state for localized slug editing in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PostForm.astro`
- [X] T015 [US1] Add per-language slug inputs and auto-generate-from-title controls to the admin post editor in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PostForm.astro`
- [X] T016 [P] [US1] Update admin new/edit post pages to pass localized slug and description data through the form model in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/admin/posts/new.astro`
- [X] T017 [P] [US1] Update admin edit post page loading for localized slug and description data in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/admin/posts/[id]/edit.astro`
- [X] T018 [US1] Update admin post table links and summaries to use clean localized post URLs and localized descriptions in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PostTable.astro`
- [X] T019 [US1] Update shared post link generation for CMS sections and header-driven post links in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/CmsPageSections.astro`

**Checkpoint**: Editors can fully manage localized post fields and save clean localized URLs from the admin workflow.

---

## Phase 4: User Story 2 - Browse Posts In The Selected Language (Priority: P2)

**Goal**: Resolve and render published posts from language-specific clean URLs at `/{lang}/{slug}`.

**Independent Test**: Visit `/en/{slug}` and `/vi/{slug}` for a published post with localized slugs and confirm the correct post and language-specific content are rendered without the `/blog` prefix.

### Tests for User Story 2

- [X] T020 [P] [US2] Add contract assertions for clean localized post view hrefs in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/localized-post-contract.spec.ts`
- [X] T021 [P] [US2] Add integration coverage for resolving published posts by requested-language slug at clean URLs in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/localized-post-routes.spec.ts`

### Implementation for User Story 2

- [X] T022 [US2] Implement published post lookup by localized slug and language in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T023 [US2] Refactor the localized public post route to render posts from `/{lang}/{slug}` in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/[lang]/[slug].astro`
- [X] T024 [US2] Update the non-prefixed post route behavior for compatibility or redirect handling in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/blog/[...slug].astro`
- [X] T025 [P] [US2] Update blog post layout metadata and canonical link generation for clean localized URLs in `D:/Projects/edge_cms/astro-blog-starter-template/src/layouts/BlogPost.astro`
- [X] T026 [P] [US2] Update frontend header and shared navigation link builders to emit clean localized post URLs in `D:/Projects/edge_cms/astro-blog-starter-template/src/components/Header.astro`
- [X] T027 [US2] Update homepage or post-list rendering to point at clean localized post URLs in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/index.astro`

**Checkpoint**: Visitors can open the new clean localized post URLs and consistently land on the correct published post.

---

## Phase 5: User Story 3 - Fall Back Gracefully When Translations Are Incomplete (Priority: P3)

**Goal**: Keep localized post pages readable and deterministic when some translated fields or slugs are missing.

**Independent Test**: Publish a post with full English content and partial Vietnamese translations, request the Vietnamese URL, and confirm the page renders with English fallback for missing values without resolving to the wrong post.

### Tests for User Story 3

- [X] T028 [P] [US3] Add contract assertions for fallback-safe localized post responses in `D:/Projects/edge_cms/astro-blog-starter-template/tests/contract/localized-post-contract.spec.ts`
- [X] T029 [P] [US3] Add integration coverage for missing translated content, missing translated slug, and invalid slug not-found behavior in `D:/Projects/edge_cms/astro-blog-starter-template/tests/integration/localized-post-routes.spec.ts`

### Implementation for User Story 3

- [X] T030 [US3] Implement field-level fallback resolution for localized post title, description, and content reads in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T031 [US3] Implement safe default-language slug fallback rules that never cross-resolve to a different post in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/blog.ts`
- [X] T032 [US3] Update the localized post route to return not found for invalid or stale slugs after fallback resolution in `D:/Projects/edge_cms/astro-blog-starter-template/src/pages/[lang]/[slug].astro`
- [X] T033 [P] [US3] Update admin and frontend link helpers to prefer requested-language slug and fall back to default-language slug only when that post lacks a translation in `D:/Projects/edge_cms/astro-blog-starter-template/src/lib/i18n.ts`

**Checkpoint**: Partial translations remain readable, deterministic, and safe across localized post routes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish migration-safe rollout, validate documentation, and run cross-story verification.

- [X] T034 [P] Update the localized post quickstart validation notes if implementation details changed in `D:/Projects/edge_cms/astro-blog-starter-template/specs/007-localized-post-urls/quickstart.md`
- [X] T035 Update agent context and feature notes for localized post URLs in `D:/Projects/edge_cms/astro-blog-starter-template/AGENTS.md`
- [X] T036 Run full regression validation for localized post URLs with `npm test` and `npm run check` from `D:/Projects/edge_cms/astro-blog-starter-template`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and reuses localized post persistence from Phase 2.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and builds on the route resolution introduced in User Story 2.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can be delivered first as the MVP once foundational data and helper work is complete.
- **US2 (P2)**: Uses the localized post data model from US1 but remains independently testable once the localized post records exist.
- **US3 (P3)**: Depends on the route resolution behavior from US2 and adds fallback and hardening logic without changing the core authoring workflow from US1.

### Within Each User Story

- Tests should be written before or alongside implementation and must cover the story’s independent test path.
- Data/helper updates come before UI or route consumption.
- Route or form integration comes after validation and helper behavior is in place.
- Each story should be validated independently before moving to the next priority.

### Parallel Opportunities

- `T005`, `T007`, and `T009` can run in parallel once the migration scaffold exists.
- `T014`, `T016`, and `T017` can run in parallel within US1 after the shared persistence updates land.
- `T025` and `T026` can run in parallel within US2 after localized route resolution is implemented.
- `T028` and `T029` can run in parallel within US3 while fallback logic is being finalized.

---

## Parallel Example: User Story 1

```bash
# Run US1 test coverage tasks together:
Task: "Add contract coverage for create/update post payloads with localized slug and description objects in tests/contract/localized-post-contract.spec.ts"
Task: "Add integration coverage for admin post form submission and localized edit reload behavior in tests/integration/localized-post-routes.spec.ts"

# Run US1 UI wiring tasks together after API payload handling is in place:
Task: "Extend post form field defaults and submission state for localized slug editing in src/components/admin/PostForm.astro"
Task: "Update admin new/edit post pages to pass localized slug and description data through the form model in src/pages/admin/posts/new.astro"
Task: "Update admin edit post page loading for localized slug and description data in src/pages/admin/posts/[id]/edit.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate localized post authoring independently from the admin workflow.
5. Demo editor-facing multilingual clean URL creation before continuing.

### Incremental Delivery

1. Finish Setup + Foundational to establish localized post persistence and route helpers.
2. Deliver US1 so editors can author multilingual clean post URLs.
3. Deliver US2 so visitors can browse the new `/{lang}/{slug}` post routes.
4. Deliver US3 so incomplete translations still resolve safely with English fallback.
5. Finish Polish with full regression validation.

### Parallel Team Strategy

1. One developer handles migration and shared helper tasks in Phase 2.
2. After Phase 2, one developer can focus on admin authoring tasks in US1 while another prepares route/list rendering changes for US2.
3. Once US2 route resolution is stable, fallback and edge-case hardening in US3 can proceed in parallel with final docs/test cleanup.

---

## Notes

- `[P]` tasks target different files and avoid incomplete-task dependencies.
- `[US1]`, `[US2]`, and `[US3]` labels map directly to the stories in `spec.md`.
- The suggested MVP scope is **User Story 1**.
- Keep old `/blog/...` handling migration-safe, but treat the clean localized route as the canonical target.
