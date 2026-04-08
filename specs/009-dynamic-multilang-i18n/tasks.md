# Tasks: Dynamic Multi-Language System

**Input**: Design documents from `D:\Projects\edge_cms\astro-blog-starter-template\specs\009-dynamic-multilang-i18n\`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Not requested in the feature specification — no dedicated test tasks.

**Organization**: Phases follow user story priority from [spec.md](./spec.md); tasks use checklist format with sequential IDs.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks in the same phase)
- **[Story]**: User story label [US1]–[US4] for story phases only

## Path Conventions

Single Astro app: `src/`, `migrations/`, repository root for `wrangler.toml` and `package.json`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm deployment/migration wiring before schema changes.

- [ ] T001 Verify D1 `database` binding and `migrations_dir` in `wrangler.toml` match the repo `migrations/` folder used for new SQL files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `languages` table, D1 helpers, request-scoped catalog on `locals`, and core i18n refactor so no story uses a hardcoded `en`/`vi` list for content.

**⚠️ CRITICAL**: User story phases must not start until this phase completes.

- [ ] T002 Add `migrations/0006_languages.sql` creating `languages` (`code`, `name`, `enabled`, `is_default`), unique index on `code`, seed rows matching current `en`/`vi` behavior with `en` as default, and insert `languages.manage` permission plus `role_permissions` for `superadmin` only
- [ ] T003 Implement D1 access helpers in `src/lib/languages.ts` (list all, list enabled ordered by `name`, get default code, create/update, transactional single-default enforcement)
- [ ] T004 Extend `App.Locals` in `src/env.d.ts` with fields for enabled language codes, default language code, and optional full rows for UI labels
- [ ] T005 Load language catalog in `src/middleware.ts` on each request (query D1 via `getDb`), populate `context.locals` with default code and enabled languages; handle empty/failed read with safe fallback consistent with [research.md](./research.md)
- [ ] T006 Refactor `src/lib/i18n.ts` to remove runtime dependency on hardcoded `SUPPORTED_LANGUAGES` for content and routing: `isSupportedLanguage` / `resolveLanguage` / `resolveLocalizedValue` / `getLocalizedPostPath` / `getLocalizedPagePath` accept catalog from `locals` or explicit parameters; keep file-based UI dictionaries in `locales/*.json` as today

**Checkpoint**: Foundation ready — admin APIs and pages can use `languages.ts` and `locals`.

---

## Phase 3: User Story 1 — Admin manages the language catalog (Priority: P1) 🎯 MVP

**Goal**: Administrators can CRUD languages, enable/disable, and set exactly one default (FR-001–FR-004).

**Independent Test**: Use admin UI and D1 to add a language, toggle enabled, switch default; verify only one `is_default` and disabled languages hidden from public policy where applicable.

### Implementation for User Story 1

- [ ] T007 [US1] Add `src/pages/api/admin/languages/index.ts` with GET (list all for admin) and POST (create) guarded by `requireApiPermission` with `languages.manage` and JSON validation for `code`/`name`/`enabled`/`is_default`
- [ ] T008 [US1] Add `src/pages/api/admin/languages/[code].ts` with PATCH (update name, enabled, default) and appropriate 404/400 handling
- [ ] T009 [US1] Add admin UI `src/pages/admin/languages/index.astro` (list + create/toggle/default actions using Bootstrap patterns consistent with `src/pages/admin/posts/`) and wire forms to the new APIs
- [ ] T010 [US1] Register `src/lib/rbac/policies.ts` route permissions for `/admin/languages` and add a sidebar link in `src/components/admin/Sidebar.astro` (and any admin nav partial) visible to roles with `languages.manage`

**Checkpoint**: Language catalog manageable without code deploys.

---

## Phase 4: User Story 2 — Readers see content with fallback (Priority: P2)

**Goal**: Translatable fields resolve using the active language, then the **current default** from D1 when a key is missing (FR-005, FR-006).

**Independent Test**: Create a post with only default-language slug/title/body; browse under a second enabled language and confirm visible text falls back to default; change default in admin and confirm fallback source updates.

### Implementation for User Story 2

- [ ] T011 [US2] Update `src/lib/blog.ts` to use the catalog default language code (from `locals` or passed `defaultLanguage`) instead of `DEFAULT_LANGUAGE` for `toBlogPost`, `findPublishedPostRecordBySlug`, `assertPublishedPostSlugUniqueness`, `normalizeLocalizedText` validation, and related helpers
- [ ] T012 [P] [US2] Update `src/lib/forms.ts` default language selection and field resolution to use the same dynamic default code where `DEFAULT_LANGUAGE` is used today
- [ ] T013 [US2] Align `src/lib/i18n.ts` `normalizeLocalizedText` “require default” checks with the catalog default code (not a fixed `"en"` string) wherever posts/pages/forms persist JSON

**Checkpoint**: Content fallback follows DB default.

---

## Phase 5: User Story 3 — Public URLs use `/{lang}/{slug}` (Priority: P3)

**Goal**: Valid enabled `lang` segments resolve pages/posts; unknown/disabled segments get a controlled redirect or 404 per [research.md](./research.md) (FR-007, FR-010).

**Independent Test**: Hit a valid `/{enabledCode}/{slug}/` URL, then repeat with a disabled/fake first segment and confirm redirect to default-language path or 404 when slug missing.

### Implementation for User Story 3

- [ ] T014 [US3] Update `src/pages/[lang]/[slug].astro` to validate `lang` against `locals` enabled set; on invalid/disabled `lang`, `Astro.redirect` to `/{defaultLanguageCode}/{slug}` (preserve query) or 404 when no resource
- [ ] T015 [P] [US3] Apply the same validation/redirect rules in `src/pages/[lang]/blog/[...slug].astro`
- [ ] T016 [US3] Update `src/pages/index.astro` (and `src/pages/[slug].astro` if needed) so home and language-prefixed entry use `defaultLanguageCode` from `locals` instead of hardcoded `en`
- [ ] T017 [P] [US3] Align legacy `src/pages/blog/[...slug].astro` redirect target with `getLocalizedPostPath` using catalog default and enabled languages

**Checkpoint**: Public URLs and redirects consistent with catalog.

---

## Phase 6: User Story 4 — Language switch uses one consistent control (Priority: P4)

**Goal**: `LanguageSwitch` lists only enabled catalog languages with `name` labels in both `Header` and admin sidebar (FR-008, FR-009).

**Independent Test**: Enable/disable a language in admin; reload public and admin and confirm the switch options change without redeploy.

### Implementation for User Story 4

- [ ] T018 [US4] Refactor `src/lib/i18n.ts` `getLanguageSwitchOptions` and `getLanguageSwitchHref` to build options from `locals` enabled languages (labels from `name`) instead of `getSupportedLanguages()`
- [ ] T019 [US4] Update `src/components/LanguageSwitch.astro` to read catalog from `Astro.locals` and pass active language consistently on public and admin layouts
- [ ] T020 [US4] Verify `src/components/Header.astro` and `src/components/admin/Sidebar.astro` render the updated switch without hardcoded locale lists

**Checkpoint**: Switch is fully DB-driven and consistent.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Contracts, validation commands, and quickstart alignment.

- [ ] T021 [P] Update `specs/007-localized-post-urls/contracts/localized-post-routes.yaml` `Language` parameter from fixed enum to unconstrained string (or document dynamic catalog) to match runtime behavior
- [ ] T022 Run `npm run lint` and `npm test` from repository root and fix any regressions introduced by this feature
- [ ] T023 Walk through `specs/009-dynamic-multilang-i18n/quickstart.md` verification steps against a dev D1 database

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: None — run T001 first
- **Phase 2 (Foundational)**: Depends on T001 — **blocks all user stories**
- **Phases 3–6 (US1–US4)**: All depend on Phase 2 completion
- **Phase 7 (Polish)**: Depends on all desired user story phases complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on US2–US4
- **US2 (P2)**: Starts after Phase 2 — needs T006/T011 alignment; logically after US1 if you test via admin-created languages, but code can ship after foundation + US1
- **US3 (P3)**: Starts after Phase 2 — should follow US2 for consistent `locals` usage in pages
- **US4 (P4)**: Starts after Phase 2 — best after US3 so URLs and switch share the same catalog

### Suggested Sequential Order

`Phase 1 → Phase 2 → US1 → US2 → US3 → US4 → Polish`

### Within Each Story

- US1: API routes before UI; RBAC last
- US2: `blog.ts` then `forms.ts` / `i18n.ts` validation
- US3: `[lang]/[slug]` before legacy blog redirects
- US4: `i18n.ts` helpers before `LanguageSwitch.astro`

### Parallel Opportunities

- **Phase 2**: T003 (`src/lib/languages.ts`) and T004 (`src/env.d.ts`) can proceed in parallel before T005–T006 integration
- **US2**: T011 (`src/lib/blog.ts`) and T012 (`src/lib/forms.ts`) touch different modules — parallelizable after shared signature for default language is agreed
- **US3**: T015 (`src/pages/[lang]/blog/[...slug].astro`) and T017 (`src/pages/blog/[...slug].astro`) parallelizable after T014 pattern is established
- **Polish**: T021 contract update parallel to T022 if different owners

---

## Parallel Example: User Story 2

```text
# After T011 contract for default language is clear:
Task: "Update src/lib/blog.ts to use catalog default language code..."
Task: "Update src/lib/forms.ts default language selection..."
```

---

## Parallel Example: User Story 3

```text
# After redirect behavior is fixed in T014:
Task: "Apply the same validation in src/pages/[lang]/blog/[...slug].astro"
Task: "Align legacy src/pages/blog/[...slug].astro redirect target..."
```

---

## Implementation Strategy

### MVP First (User Story 1 after Foundation)

1. Complete Phase 1–2 (T001–T006)
2. Complete Phase 3 / US1 (T007–T010)
3. **STOP and VALIDATE**: Admin can manage catalog end-to-end
4. Add US2–US4 incrementally

### Incremental Delivery

1. Foundation → catalog in DB + `locals`
2. US1 → admin CRUD
3. US2 → correct fallback for readers
4. US3 → correct public URLs and redirects
5. US4 → unified switch
6. Polish → contracts + CI

### Task Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 23 |
| **Phase 1** | 1 |
| **Phase 2** | 5 |
| **US1** | 4 |
| **US2** | 3 |
| **US3** | 4 |
| **US4** | 3 |
| **Polish** | 3 |

---

## Notes

- Every task includes at least one concrete file path in the description
- [P] tasks use different files and do not depend on incomplete sibling work
- Commit after each task or small group; re-run `npm run lint` frequently during US2–US4
