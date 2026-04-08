# Feature Specification: Admin builder table UX

**Feature Branch**: `011-admin-builder`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Refactor the admin page builder UX for page sections, navigation items, and admin headings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Page section table and drag reorder (Priority: P1)

Admins edit which sections appear on a page by selecting them through an "Add section" action, arranging the resulting rows in a compact table, and dragging rows to establish the publish order so that the live page reflects the chosen sequence without manual number edits.

**Why this priority**: Page sections define the visitor experience, so replacing the clunky checkbox/order-number workflow with a single table and drag handles addresses the most common layout complaint and ensures the admin can control presentation precisely.

**Independent Test**: Add, reorder, and remove a few sections via the new table controls, save, refresh the page, and confirm the saved order matches the last drag operation while only the explicitly added sections remain visible.

**Acceptance Scenarios**:

1. **Given** an empty page section list, **When** the admin adds a section, **Then** the section appears as a new row showing its type, a drag handle, any section-specific controls, and a remove button.
2. **Given** multiple rows in the table, **When** the admin drags one row to a new position and saves, **Then** the persisted section order and the live preview reflect the rearranged row order after a refresh.

---

### User Story 2 - Contact form field table (Priority: P2)

Contact form designers insert fields with localized labels, set required toggles, and reorder them inside a dense table that exposes add/remove actions and drag handles instead of manual order inputs.

**Why this priority**: Contact form field order is foundational for submission clarity, and the existing manual-order inputs make adjustments slow and error-prone; a drag-and-drop table keeps the configuration consistent with the rest of the builder.

**Independent Test**: Create three contact form rows, mark one as required, change localized labels, drag them into a new sequence, save, and verify the required flag, labels, and order persist after reloading the admin form.

**Acceptance Scenarios**:

1. **Given** a contact form with no custom fields, **When** the admin clicks "Add field", **Then** a new row is appended with selectors for field type, inline localized labels, a required toggle, a drag handle, and a remove action visible in a compact layout.

---

### User Story 3 - Navigation item reordering (Priority: P3)

Navigation rows keep their existing "Add row" behavior but now live inside a dense table with drag handles; dragging a navigation row reorders both the visual table and the persisted nav sequence without introducing new helper text.

**Why this priority**: Navigation reorder is a lower-risk change but benefits from parity with the other tables and the drag-and-drop workflow, ensuring admins do not need to rely on manual numbering.

**Independent Test**: Drag two existing navigation entries to new positions, save, and refresh the navigation preview to confirm the order matches the table without extra helper copy introduced.

**Acceptance Scenarios**:

1. **Given** at least two navigation rows, **When** the admin drags one with the new handle, **Then** the reordered sequence is reflected visually immediately and remains after saving and refreshing the navigation list.

---

### Edge Cases

- What happens when the admin drags a row beyond the current range? The table should clamp the drop to the first or last position and persist without errors.
- How is the experience when there are no sections, fields, or navigation items? Each table should surface a minimal placeholder row or message plus the "Add..." action so admins always know how to begin.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide a table-based editor for page sections that lists only the actively added sections, exposes an "Add section" action, and hides the obsolete checkbox/number inputs.
- **FR-002**: Each section row must display the section type, a drag handle for reordering, any section-specific controls (e.g., language toggles), and a remove action.
- **FR-003**: Dragging a section row must update both the on-screen order and the persisted order so the newly defined sequence survives a page refresh.
- **FR-004**: Replace the contact form field order controls with a drag-and-drop table where adding a field inserts a new row, each row includes field type, localized label inputs, a required toggle, and a remove action, and only drag-and-drop can reorder the fields.
- **FR-005**: Keep navigation items in their current table/editor, but add drag-and-drop reordering and persist the new order without changing the "Add row" controls.
- **FR-006**: Strip verbose helper text so sections such as contentAndAccessManagement display only their main title unless a concise one-line helper is necessary, reducing visual clutter across admin screens.
- **FR-007**: Adopt compact, Bootstrap-based table styling with minimal padding, no decorative chrome, and dense rows for section/contact/navigation management interfaces.

### Key Entities *(include if feature involves data)*

- **PageSectionConfig**: Represents an active section with attributes for type, localized title, section-specific controls, and an explicit sort order to store with the page record.
- **ContactFormFieldConfig**: Tracks field type, localized label map, required flag, and sort order so drag-and-drop rearrangement is persisted in D1 alongside form submissions.
- **NavigationItemConfig**: Captures link label, target path, visibility rules, and sort order; drag-and-drop updates the navigation order column in the existing table without additional metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of drag-and-drop reorder operations for sections persist exactly as arranged, verified by saving and reloading the builder for three different pages within 2 seconds of the action.
- **SC-002**: Contact form field rows retain their localized label texts, required state, and drag order after save/reload; manual verification covers at least three different language inputs and position changes.
- **SC-003**: Navigation item reorders using the new drag handles remain stable after saving and refreshing, matching the table order for each tested navigation block.
- **SC-004**: Admin builder screens only show one line of explanatory helper text per section (instead of multi-line paragraphs) and all table rows remain compact (no padding taller than two units) when the UI is scaled to the default admin viewport.

## Assumptions

- Admins keep using the existing RBAC-enabled admin session flow, so no new auth changes are required for these table edits.
- Section, contact field, and navigation order persistence continues to rely on the current D1-backed columns that already store sort indexes.
- Localized labels for contact form rows use the existing JSON/text dictionaries; no new storage schema is introduced in this feature.
- Bootstrap-based admin layout utilities remain the shared styling layer, so this rework can reuse the same CSS classes with tighter spacing.
