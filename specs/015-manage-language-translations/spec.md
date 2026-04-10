# Feature Specification: Language translation management

**Feature Branch**: `015-manage-language-translations`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "Enhance the admin language management flow so administrators can manage translation entries per language by adding an Edit action and dedicated translation pages backed by D1."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open language translation workspace (Priority: P1)

As an administrator, I need to open the translation entries for a single language so that I can verify and manage localized strings without leaving the admin surface.

**Why this priority**: Without a language-specific workspace I cannot see or change translations that belong to only one language, which blocks all translation work.

**Independent Test**: From the /admin/languages list, click Edit for a language, confirm the navigation lands on a dedicated translation page, and verify the listing shows only data for that language.

**Acceptance Scenarios**:

1. **Given** the languages table lists multiple locales, **When** the admin clicks Edit for the Spanish row, **Then** the UI navigates to the Spanish translation page, the heading identifies Spanish, and the table only shows entries whose language_id matches Spanish.
2. **Given** the translation page is open, **When** the D1 query returns rows for other locales, **Then** those rows are not rendered and the page remains scoped to the selected language.

---

### User Story 2 - Add a translation entry (Priority: P2)

As an administrator, I need to add new translation keys for the selected language so that units of localized text can be created on demand.

**Why this priority**: Adding new keys is the primary way new content gets translated, so the flow must be available within the language page.

**Independent Test**: On the language translation page, use the add/save controls to create a new key/value pair, then reload the page to ensure the row persists for that language.

**Acceptance Scenarios**:

1. **Given** the translation page is focused on French, **When** the admin submits a new key and value for that language, **Then** the new row appears in the table and a follow-up query returns the row with language_id set to French.

---

### User Story 3 - Update or delete translation entries (Priority: P3)

As an administrator, I need to edit or remove existing translation rows so that stale or incorrect text can be fixed.

**Why this priority**: Ongoing translation maintenance depends on updates and deletions, so these actions must remain available in the same context.

**Independent Test**: Edit the value of an existing translation row and/or delete a row, then confirm the updated state persists when the page reloads.

**Acceptance Scenarios**:

1. **Given** a translation row is present, **When** the admin changes its value and saves, **Then** the table refreshes with the new text and the underlying D1 record reflects the change.
2. **Given** a translation row is present, **When** the admin deletes it, **Then** the row disappears from the table and repeated fetches do not return the deleted entry.

---

### Edge Cases

- When a language has no translation_entries yet, the page shows a call-to-action encouraging the admin to add the first key and keeps the add controls enabled.
- When a duplicate key is submitted for a language, the UI surfaces a validation message and prevents the duplicate while keeping existing entries intact.
- When D1 or the network fails, the page shows a dismissible error banner and keeps form controls disabled until the request succeeds or the admin retries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: /admin/languages continues to list every language and, in the same row as its label, adds an Edit action that navigates to a language-specific translation page.
- **FR-002**: The translation page for a language loads translation_entries filtered by language_id, renders their key/value pairs, and displays meta information such as last-updated timestamps.
- **FR-003**: The translation page provides a form to create a new key/value pair for the current language and persists it to the translation_entries table.
- **FR-004**: Every row on the translation page supports editing its value (and optionally the key) and saving changes back to D1 without losing the language context.
- **FR-005**: Every row also supports deletion with a confirmation step, and removals are reflected in subsequent translation page loads.

### Key Entities *(include if feature involves data)*

- **languages**: Represents a supported locale with attributes such as id, code (e.g., "fr"), and display name. Each language row appears on /admin/languages.
- **translation_entries**: Represents a translation key/value pair tied to a language_id. Key attributes include language_id, key, value, source metadata, and timestamps; only entries whose language_id matches the selected language are shown on the detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every language row on /admin/languages shows an Edit action that reliably navigates to the expected language translation page.
- **SC-002**: The translation detail page never shows entries for another language—only translation_entries with matching language_id are rendered.
- **SC-003**: Admins can add, edit, and delete translation rows from within the translation page, and each change persists (visibility can be confirmed by reloading the page and seeing the updated rows).
- **SC-004**: Each translation operation (navigation, add, edit, delete) completes within three UI interactions so administrators can manage entries without leaving the page.

## Assumptions

- An admin who reaches /admin/languages already passes the RBAC checks, so no additional authentication UI is required for this flow.
- The translation_entries table in D1 already stores language_id, key, value, and metadata, and this schema does not change for the feature.
- Existing admin layouts, navigation, and styling remain available and can be reused so no new client framework is introduced.
- Future languages are defined in the languages table before translation entries are created, so the list page does not need to support ad-hoc language creation.
