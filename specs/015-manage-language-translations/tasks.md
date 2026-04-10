# Tasks: Language translation management

**Input**: Design documents from `/specs/015-manage-language-translations/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Tests**: Not explicitly requested in the feature spec

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the files and routes that all stories rely on before any translation logic is implemented.

- [x] T001 Create `src/lib/translations.ts` that exports placeholders for listing, creating, updating, and deleting `translation_entries` so later tasks can implement D1 SQL against the existing `translation_entries` table.
- [x] T002 Scaffold the dynamic route file `src/pages/admin/languages/[locale].astro` that mounts the admin layout and boilerplate structure for a locale-specific workspace.
- [x] T003 Update `src/pages/admin/languages.astro` to render an Edit action/button per language row that links to `/admin/languages/{language.code}` and uses the current Bootstrap/utility classes for consistency.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the new route to the translation helpers and ensure locale filtering works before building story-specific UI.

- [x] T004 Implement the D1 helpers in `src/lib/translations.ts` (getEntriesByLanguage, insertEntry, updateEntry, deleteEntry) using the shared D1 client so all stories can call the same persistence layer.
- [x] T005 In `src/pages/admin/languages/[locale].astro`, add the server-side `load`/data-fetch logic that reads the `locale` route param, queries `translation_entries` via the helper, and exposes the entries plus locale metadata to the template.
- [x] T006 Validate the incoming `locale` parameter in `[locale].astro` and reuse the existing RBAC guard or layout so only authenticated admins can reach the page and only entries whose `language_id` match the locale render.

---

## Phase 3: User Story 1 - Open language translation workspace (Priority: P1)

**Goal**: Let admins open `/admin/languages/[locale]`, see the locale heading, and view translation rows filtered by that locale.  
**Independent Test**: Click Edit on `/admin/languages`, land on `/admin/languages/{code}`, and confirm the page shows only translation entries whose `language_id` equals the selected locale.

- [x] T007 [US1] Render the translation entries table inside `src/pages/admin/languages/[locale].astro` showing `key`, `value`, `source`, and `updated_at` per row while binding to the entries provided by the load function.
- [x] T008 [US1] Display the locale-friendly display name or code in the header, show a row count, and add an empty-state call-to-action (e.g., “Add the first translation”) that explains the workspace is scoped to the selected language.

---

## Phase 4: User Story 2 - Add a translation entry (Priority: P2)

**Goal**: Allow admins to create new translation keys/values for the current locale from within the locale workspace.  
**Independent Test**: Submit the “new translation” form on `/admin/languages/{locale}` and reload to see the row persisted for that locale.

- [x] T009 [US2] Add a form (key, value, optional context/source) inside `src/pages/admin/languages/[locale].astro` that POSTs to a server action or handler wired to the helper’s insertEntry, keeping the locale context in the request.
- [x] T010 [US2] After form submission, refresh the entries list and surface success or validation feedback while preventing duplicate `(language_id, key)` pairs per data-model rules.

---

## Phase 5: User Story 3 - Update or delete translation entries (Priority: P3)

**Goal**: Give admins inline edit and remove controls for translation rows so stale copies can be corrected or removed without leaving the workspace.  
**Independent Test**: Update the value of a row and delete another row on `/admin/languages/{locale}`, then confirm both data changes persist in D1 for the selected locale.

- [x] T011 [US3] Add edit controls (e.g., per-row form or modal) in `src/pages/admin/languages/[locale].astro` that call the helper’s updateEntry, letting admins change the value/context and keeping the locale filter intact.
- [x] T012 [US3] Add a delete button with confirmation per translation row in the same file that calls the helper’s deleteEntry and removes the row from the rendered list upon success.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Document and polish the new translation flow after functionality exists.

- [x] T013 Update `docs/language-management.md` to describe the new `/admin/languages/[locale]` translation workspace, its CRUD capabilities, and how it reuses the existing D1 `translation_entries` table.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 ➜ Phase 2**: Foundation work (helper file, route, Edit link) must finish before loading data or implementing CRUD.
- **Phase 2 ➜ Phase 3+**: Locale filtering and helpers block all user stories—don’t start story work until Phase 2 tasks complete.
- **User Stories (Phase 3−5)**: Each story can execute after Phase 2 and is independently testable.
- **Phase 6**: Runs after all stories are complete.

### User Story Dependencies
- **US1 (P1)**: Depends on Phase 2 completion to guarantee filtered data is available; no cross-story dependencies.
- **US2 (P2)**: Needs US1’s workspace to exist so the add form can refresh the same view.
- **US3 (P3)**: Reuses the elements created for US1/US2 but can also operate independently once Phase 2 is ready.

### Parallel Opportunities
- Phase 1 tasks touch different files (`src/lib/translations.ts`, `[locale].astro`, `languages.astro`) and can be worked on in parallel.
- Phase 2 tasks are sequential because the helper must be in place before the page can execute queries, but each user story (US1, US2, US3) can be worked on by different contributors after Phase 2 finishes.
- Within each user story, the table rendering, form submission, and per-row controls (edit/delete) touch the same file (`[locale].astro`) and should be coordinated but still follow the story order.
