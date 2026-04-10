---

description: "Task list for migrating localization storage and runtime loading into Cloudflare D1."
---

# Tasks: Dynamic Localization Data Migration

**Input**: Design documents from `/specs/013-d1-localization-migration/`
**Prerequisites**: plan.md (required), spec.md (mandatory for user stories), research.md, data-model.md, contracts/, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the Cloudflare D1 schema and documentation that every later story relies on.

- [x] T001 Create `migrations/0007_translation_entries.sql` to define the `translation_entries` table (`locale_code`, `translation_key`, `translated_value`, `updated_at`, unique constraint, and locale indexes) so D1 can store per-key translations.
- [x] T002 Draft `docs/localization.md` describing the new D1-backed translation pipeline, the list of supported locales, the `*Description` clean-up rule, and how to run the import script or invalidation helpers when copy changes.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared service and API that user stories consume.

- [x] T003 Implement `src/lib/localization.ts` with functions that query `env.DB` for translations by `locale_code` (optionally filtered by namespace), aggregate rows into a `Record<string, string>`, and expose metadata such as `fallback` and `lastUpdated`.
- [x] T004 Add `src/pages/api/localizations.ts` to surface a `GET /api/localizations` endpoint that accepts `locale` and `namespace` query params, calls the localization service, and returns `{ locale, fallback, lastUpdated, translations }`.

---

## Phase 3: User Story 1 - Localized admin UI renders from the dynamic store (Priority: P1) 🎯 MVP

**Goal**: Replace the legacy `locales/*.json` bundle with the D1-backed translations so every navigation label, button, and help message renders according to the requested locale.

**Independent Test**: Load an admin page in English and Vietnamese and confirm `t("nav.home")`, `t("actions.createPost")`, and other keys come from a dynamic payload instead of the previous static tree.

### Implementation for User Story 1

- [x] T005 [US1] Refactor `src/lib/i18n.ts` to drop the `locales/*.json` imports, request translations from `src/lib/localization.ts`, and keep `UiTranslations.t` backed by the runtime payload while still falling back to the default language.
- [x] T006 [US1] Update `tests/integration/ui-i18n-routes.spec.ts` so it mocks the new localization API response and asserts that `getUiTranslations` continues to resolve keys per the dynamic payload.
- [x] T007 [US1] Update `tests/integration/dynamic-form-ui-routes.spec.ts` so it likewise mocks/localizes responses in the new format and verifies the dynamic loader still renders form labels.

---

## Phase 4: User Story 2 - Translation edits appear without redeploy (Priority: P2)

**Goal**: Cache translations on the edge but let the service re-fetch when D1 rows change so editors see updates without redeploys.

**Independent Test**: Update a translation row in D1 (e.g., via `wrangler d1 execute`), wait once TTL expires, then reload an admin page and confirm the new string appears without rebuilding the site.

### Implementation for User Story 2

- [x] T008 [US2] Extend `src/lib/localization.ts` with per-locale/namespace caching that records `lastUpdated`, respects a short TTL, and exposes an invalidation helper so `getUiTranslations` can refresh after edits.
- [x] T009 [US2] Enhance `src/pages/api/localizations.ts` to include `lastUpdated` and `fallback` metadata (plus namespace echo) so callers know when to invalidate their caches.

---

## Phase 5: User Story 3 - Migration and payload cleanup removes verbose metadata (Priority: P3)

**Goal**: Migrate existing `locales/*.json` content into D1 while dropping non-user-facing description fields (`permissionCatalogDescription`, `*Description`, etc.).

**Independent Test**: Run the import script and assert that the number of rows per locale matches the set of keys without `Description` values, and verify runtime payloads never include those fields.

### Implementation for User Story 3

- [x] T010 [US3] Add `scripts/import-localizations.ts` that flattens `locales/<code>.json`, filters out keys ending in `Description`, and upserts the remaining entries into `translation_entries` via the `DB` binding.
- [x] T011 [US3] Execute `node scripts/import-localizations.ts` (or `wrangler d1 execute`) to seed `translation_entries` for supported locales, then confirm the table row counts match the cleaned key list.
- [x] T012 [US3] Remove description-style keys from `locales/en.json` and `locales/vi.json` so the repo no longer keeps the unused metadata.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Capture the new workflow in docs and confirm the quickstart steps still align with the implementation.

- [x] T013 Update `README.md` (or the admin README section) to mention translations now live in D1 and point to `scripts/import-localizations.ts`/`docs/localization.md` for future edits.
- [x] T014 Review `specs/013-d1-localization-migration/quickstart.md` to ensure it describes the actual migration/import commands, API contract, and UI verification steps introduced here.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Blocks all user stories until the localization service and API exist.
- **User Story phases (Phase 3+)**: Require Phase 2 completion; each story can proceed independently afterward.
- **Polish (Phase 6)**: Depends on the user stories it documents being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Needs the localization service/API from Phase 2 before swapping out JSON bundles; no dependence on US2/US3.
- **User Story 2 (P2)**: Builds on US1 but can start as soon as the service exists; cache tuning is independent of migration.
- **User Story 3 (P3)**: Ready once the migration tools and schema exist (Phases 1+2) and does not rely on US1/US2 runtime changes.

### Within Each User Story

- Service/Model changes before API/endpoint work.
- API metadata before UI caching (US2).
- Migration script before data verification (US3).

## Parallel Opportunities

- T001 & T002 can run simultaneously (schema vs. doc work).
- T003 & T004 can overlap because the service and API can be developed in parallel.
- US1 test updates (T006/T007) can happen while `src/lib/i18n.ts` is refactored (T005).
- US2 and US3 phases are independent, so their tasks can be staffed in parallel after Phase 2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Finish Phase 1 (schema + doc) and Phase 2 (service + API) so translations can be loaded from D1.
2. Focus on US1 (T005–T007): refactor `src/lib/i18n.ts` and update the existing integration tests to prove UI strings still resolve.
3. Validate via the updated tests and a quick admin/localized page walkthrough before stopping for approval.

### Incremental Delivery

1. Once the runtime switch works, add US2 caching (`T008`, `T009`) so editors’ updates surface quickly; verify TTL behavior.
2. Add US3 migration tools (`T010`–`T012`) and reseed the table; confirm no description payloads leak.
3. After each story, run the necessary tests and document the workflow in README/quickstart.

### Parallel Team Strategy

1. Pair on Phases 1–2 to create the schema, service, and API.
2. Split the remaining work: one person handles US1 testing/fallback, another tunes caching (US2), and a third builds the migration/import flow (US3).
3. Finish with the Polish phase to keep docs and quickstart accurate before merging.
