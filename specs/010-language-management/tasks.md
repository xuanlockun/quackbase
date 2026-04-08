# Tasks: Language Management System

**Input**: Design documents from `/specs/010-language-management/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/languages-api.md`

**Tests**: Not explicitly requested; manual verification steps live in `specs/010-language-management/quickstart.md`.

**Organization**: Tasks are grouped by user story so each slice can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture the shared vocabulary, contracts, and schema that every story builds on.

- [X] T001 Document the languages schema, invariants (only one default, at least one enabled), RBAC permission, and the admin/dropdown UX expectations in `docs/language-management.md`.
- [X] T002 Export a typed `LanguageEntry` / catalog shape from `src/lib/languages.ts` (alongside the existing `LanguageRow`) so the admin page, dropdown component, and API contracts all rely on the same definition.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Harden the shared language service and middleware so toggles, defaults, and fallbacks never leave the user in an unsupported state.

- [X] T003 Add helper logic inside `src/lib/languages.ts` (e.g., `toggleLanguageEnabled` and `setLanguageDefault`) that enforces the "one default / at least one enabled" rules before mutating DB rows and reuse it from the admin `POST`/`PATCH` handlers.
- [X] T004 Update `src/middleware.ts` to guard `loadLanguageCatalog` so it always provides a non-empty `locals.languageCatalog` (capture failures, refresh cached defaults, and log unexpected states) before the header/dropdown renders.

---

## Phase 3: User Story 1 - Admin controls enabled languages (Priority: P1)

**Goal**: Give editors a `/admin/languages` page where they can create a new language, toggle enable/disable, and set exactly one default while the UI stays in sync with the DB.

**Independent Test**: Visit `/admin/languages`, create a new code/name pair, toggle the enabled checkbox and default radio on any row, and observe the list update without the page reloading; invalid actions (disabling the only enabled language or creating a duplicate code) must be blocked.

- [X] T005 [US1] Create `src/components/admin/LanguageTable.astro` that renders the language catalog table with columns for code, name, "enabled" toggle, "default" radio, and a status badge; expose data attributes so a manager script can post `PATCH /api/admin/languages/[code]` updates without reloading the page.
- [X] T006 [US1] Create `src/components/admin/LanguageForm.astro` that renders a creation form (code, display name, enable toggle, default toggle) and exposes hooks for the manager script to call `POST /api/admin/languages`.
- [X] T007 [US1] Implement `src/pages/admin/languages.astro` using `AdminLayout`; server-render the catalog by calling `listAllLanguages`, pass data and translations to the new components, and surface load/error states for the table and form.
- [X] T008 [US1] Add a client-side manager script under `src/components/admin/language-manager.ts` (imported with `client:load`) that wires the table and form components to the admin APIs, enforces front-end validation (code format, name required), and shows success/error notices when the backend rejects a toggle or creation.
- [X] T009 [US1] Extend `locales/en.json` and `locales/vi.json` with the new labels, hints, and error/copy strings used on `/admin/languages` (table headers, helper text, success/failure messages) so the page is fully localized.

---

## Phase 4: User Story 2 - Consistent dropdown switch (Priority: P2)

**Goal**: Replace the current button-based switch with a dropdown that shows exactly the enabled languages from the D1 catalog and highlights the active language in both header and admin sidebar.

**Independent Test**: Open the site and admin shell, expand the dropdown, verify each enabled language appears once, the current language is highlighted, and selecting another language reloads the same route with the new `/[lang]/` prefix without duplicate segments.

- [X] T010 [US2] Rewrite `src/components/LanguageSwitch.astro` to use a select/dropdown pattern that enumerates `getLanguageCatalog(Astro.locals).enabledLanguages`, highlights the active language, and uses the shared `switchLang` helper to build hrefs; keep the component unopinionated so both the public header and admin sidebar reuse it.
- [X] T011 [US2] Adjust `src/components/Header.astro` markup and spacing so the new dropdown lines up with the nav links (update classes or wrappers to match the existing header width/height expectations).
- [X] T012 [US2] Update `src/components/admin/Sidebar.astro` styling around the language block so the dropdown there matches the header component, and ensure the block reuses the same `LanguageSwitch` without duplicating logic.

---

## Phase 5: User Story 3 - Stable routing and fallback (Priority: P3)

**Goal**: Guarantee `/[lang]` routes resolve, prevent duplicate prefixes when switching, support dynamically added languages, and fall back to the default when an unknown language or missing translation is encountered.

**Independent Test**: Navigate to a `/[lang]/` route for a language that exists, one that does not (manually remove/rename a code), and a route whose translation is missing; the site should render using the default language copy while keeping the user on a valid URL without errors.

- [X] T013 [US3] Update `src/lib/i18n.ts` (`switchLang`, `withLanguagePrefix`, `resolveLanguage`, and `getLanguageSwitchOptions`) so switching strips any existing prefix, never appends duplicates, honors the language catalog from the database, and resolves unknown codes/translations by falling back to the default language code.
- [X] T014 [US3] Enhance `src/middleware.ts` to treat unsupported prefixes as fallbacks (e.g., rewrite unknown `/xx/` routes to the default or to safe equivalents), keep `locals.languageCatalog` synchronized with the latest DB state, and preserve the last requested language when resolving UI preferences.
- [X] T015 [US3] Capture the fallback expectations (default route rewrite, translation fallback) in documentation notes (e.g., `docs/language-management.md` or `specs/010-language-management/quickstart.md`) so QA can retrace the routing behavior described above.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Tie up documentation and provide final verification guidance.

- [X] T016 [P] Update `specs/010-language-management/quickstart.md` so its validation steps mention creating a language, toggling the dropdown in both header and admin, and exercising routing fallbacks with unknown language prefixes.
- [X] T017 [P] Review `AGENTS.md` or other living docs to confirm the new feature's stack/DB notes are still accurate after the implementation changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Documents/types must exist before shared helpers or UI assume them.
- **Foundational (Phase 2)**: The language service helpers and middleware guards block the user stories because they enforce invariants that the admin page, dropdown, and router rely on.
- **User Stories (Phase 3+)**: Each story depends on the foundational helpers but can otherwise proceed in priority order; the admin UI (US1) should land before dropdown polishing (US2) so the new catalog data is stable.
- **Polish (Final Phase)**: Waits for all stories and foundational work to finish so documentation and QA guidance reflect the final behavior.

### User Story Dependencies

- **User Story 1 (P1)**: Depends on foundational helpers (`src/lib/languages.ts`, middleware) and the new doc; produces a stable catalog for the dropdown.
- **User Story 2 (P2)**: Depends on the same catalog and `switchLang` improvements from US3 to avoid duplicates.
- **User Story 3 (P3)**: Can run alongside US2 after foundational helpers exist because it merely touches the routing helpers that all stories consume.

### Within Each User Story

- Models/services (Phase 2) must be ready before the UI components that consume them.
- Admin API calls should be implemented next, followed by the layout components and manager scripts.
- Drop-down UI changes rely on the updated catalog plus routing helpers, so perform them after US3 tasks that touch `switchLang`.

### Parallel Opportunities

- Documentation and type exports (Phase 1) can run in parallel with each other.
- The admin table and form components (T005/T006) can be built in parallel before wiring them in `languages.astro`.
- After foundational helpers land, the dropdown UI (US2) and routing fix (US3) can proceed in parallel because they touch different modules.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup documents/types and Phase 2 foundational helpers to secure the catalog.
2. Implement the `/admin/languages` page (T005-T009) and verify admin users can manage languages.
3. Stop and validate that toggling languages keeps at least one default/enabled and updates the database without errors.

### Incremental Delivery

1. Deliver US1 (admin page), then deploy/demo that slice before touching the dropdown.
2. Add US2 (dropdown) and US3 (routing) incrementally; each story should be testable on its own.
3. Run the polish tasks (T016-T017) once all three stories behave as expected.
