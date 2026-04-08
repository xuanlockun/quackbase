# Feature Specification: Admin Builder UX Tables

**Feature Branch**: `012-admin-builder-refactor`  
**Created**: April 8, 2026  
**Status**: Draft  
**Input**: User description: "Refactor the admin page builder UX for page sections, navigation items, and admin headings. Problems: - Page sections currently use manual checkbox + manual order input, which is clunky - Contact form fields use manual order inputs and do not support drag-and-drop - Navigation items already support add row but do not support drag-and-drop reordering - Some admin helper text is too verbose, especially contentAndAccessManagement Requirements: 1. Page Sections UX - Replace checkbox + manual order inputs with a table-based editor - Each section should be added explicitly using an Add section action - Only added sections should appear in the table - Reordering sections should use drag-and-drop instead of manual number input - Removing a section should remove it from the active page sections list 2. Section Table Behavior - Each active section should appear as a row in a table - Rows should include: section type; drag handle; section-specific controls; remove action - Drag-and-drop should update visual order and persisted order 3. Contact Form Fields UX - Replace manual order input with drag-and-drop - Add field should insert a new row/component into the table - Each field should support: field type; localized labels; required toggle; remove action - Reordering should be done by drag-and-drop only 4. Navigation Items UX - Keep the existing table and add row behavior - Add drag-and-drop support to reorder navigation items - Persist the new order after dragging 5. Admin Copy Simplification - Remove verbose helper text where unnecessary - Simplify sections like contentAndAccessManagement so that only the main title is shown when possible - Reduce visual noise and make admin screens more compact 6. UI Style - Use compact Bootstrap-based admin UI - Avoid excessive helper text, padding, and decorative elements - Use dense table-style management interfaces Goal: A cleaner admin builder experience where sections, navigation items, and shared form fields are managed through compact tables with drag-and-drop ordering instead of manual order inputs."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Manage page sections via table (Priority: P1)

As an admin who assembles content pages, I need to pick page sections from a curated catalog, add them explicitly, and reorder them in a single compact table so I can see exactly which sections are live without juggling checkboxes and manual order values.

**Why this priority**: Page sections define the structure of every published page, so the experience must be stable, predictable, and testable before other controls matter.

**Independent Test**: Open the page builder, add three different sections through the "Add section" action, reorder them with the drag handle, and save. The builder remains functional even without touching contact form or navigation controls.

**Acceptance Scenarios**:

1. **Given** the page builder is showing the sections table with zero sections, **When** I add a section via the explicit add control, **Then** a new row appears with that section's type, its specific settings, and a drag handle.
2. **Given** there are multiple section rows, **When** I drag one row above another, **Then** the visual order reflects that move and the underlying persisted order matches the new sequence without any manual number inputs.
3. **Given** a section row exists, **When** I click its remove action, **Then** it disappears from the table and is no longer included in the active page sections list after save.

---

### User Story 2 - Manage contact form fields with the same drag-and-drop table (Priority: P2)

As a site administrator who configures the contact form, I need to add fields, mark them required, provide localized labels, and reorder them using the same table and drag handles so that the interface feels consistent with the section controls.

**Why this priority**: Clear, ordered contact form fields are critical for submissions, but they are less risky than page sections; stabilizing their reorder experience still contributes to a polished builder.

**Independent Test**: Navigate to the form field table, add a field, toggle required, enter localized labels, move it above another entry via drag-and-drop, and confirm the table reflects the updated order and required state.

**Acceptance Scenarios**:

1. **Given** the contact form has two fields, **When** I drag the bottom row to the top, **Then** the order shown in the table and the persisted order after save both match the drag-and-drop movement.
2. **Given** a newly added field, **When** I edit its localized label or hit the required toggle, **Then** the row shows the updated metadata and the change persists without touching manual order inputs.

---

### User Story 3 - Reorder navigation items and simplify admin copy (Priority: P3)

As an admin updating navigation, I want the existing navigation table and add-row flow to gain drag-and-drop ordering while the helper copy across the admin builder, especially the contentAndAccessManagement section, stays concise and only shows the needed title text so I have a calmer workspace.

**Why this priority**: Navigation and helper text changes improve polish and reduce confusion but should not block core content layout work, so they are a lower-priority follow-up.

**Independent Test**: Open the navigation items table, drag an existing row to a new position, and check that the helper description area now only shows the streamlined title without verbose paragraphs for content management pods.

**Acceptance Scenarios**:

1. **Given** the navigation table shows several items, **When** I drag a row to a new spot and save, **Then** the order persists and the helper pane now only displays the simplified heading for contentAndAccessManagement.

---

### Edge Cases

- What happens when only one section is selected and a drag action is attempted? The UI should gracefully ignore the drag yet keep the remove action available.
- How does the builder behave if drag-and-drop events fail (e.g., due to a temporary pointer glitch)? The row should snap back to its original location and no new order should persist unless the drop completes.
- What occurs when localized labels are missing for a contact field? The field row should highlight the missing locale and prevent saving until a fallback label is provided or the user confirms the required locale.
- How is the navigation table presented when no items have been added? The interface should still show the table header, the "Add navigation item" action, and minimal helper text so the screen remains compact.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The page builder MUST expose a table-based editor for active sections in which each row shows the section type, a drag handle, section-specific settings, and an explicit remove control so only selected sections appear in the list.
- **FR-002**: Adding a new section MUST be an explicit "Add section" action that appends a new row to the table instead of checking a case or editing a manual order value.
- **FR-003**: Reordering sections, contact form fields, and navigation items MUST rely solely on drag-and-drop handles and persist the new sort order without requiring numeric order edits.
- **FR-004**: The contact form fields area MUST adopt a dense table structure where each row offers the field type selector, localized label inputs, a required toggle, drag handle, and remove action so admins manage form fields with the same idiom as sections.
- **FR-005**: Navigation items MUST keep their existing table and add-row behavior while gaining drag-and-drop handles and persistence of the new order.
- **FR-006**: Helper text in the admin builder, particularly for the contentAndAccessManagement area, MUST be simplified so only the concise title is shown by default and verbose text is hidden unless explicitly requested.
- **FR-007**: The entire admin builder screen MUST use compact Bootstrap-based styling with reduced padding, fewer decorative elements, and dense table rows so the UI remains focused on management actions.

### Key Entities *(include if feature involves data)*

- **Page Section**: Represents a reusable slice of content (hero, testimonial, CTA, etc.) that can be added to a page, ordered via drag handles, removed, and saved in the page's section list.
- **Contact Form Field**: Stores metadata for each contact form entry such as field type, localized labels, required flag, and relative order determined by the table's drag handles.
- **Navigation Item**: Captures label, target, and positioning data for each row in the navigation table; order changes must persist after drag-and-drop and page reload.
- **Admin Copy Block**: Groups helper text for a screen area such as contentAndAccessManagement, with a title and supporting copy that can be toggled between expanded and compact states.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Administrators can reorder page sections, contact form fields, and navigation rows using drag-and-drop in a single interaction, and the visual order and persisted order remain in sync after saving.
- **SC-002**: 95% of flows through the admin builder display only the main title for helper copy (contentAndAccessManagement and similar areas) unless an admin explicitly expands a help panel, reducing visual noise.
- **SC-003**: Adding, removing, or reordering sections and fields can be completed without editing any numeric order inputs, and QA can verify this by confirming there are no manual order controls rendered across the builder.
- **SC-004**: The composite builder screen uses compact Bootstrap table styles (denser rows/padding) so that more than 90% of the available vertical space is dedicated to actionable rows and controls rather than helper text or decoration.

## Assumptions

- Admin users perform page builder work on desktop devices with pointer-based interaction so drag-and-drop is the preferred ordering method.
- Drag-and-drop operations are supported and tested only in modern desktop browsers that already run the admin panel (no mobile-specific adjustments in this release).
- Existing backend APIs that persist sections, navigation, and form field orderings already accept an ordered list, so this feature scopes to changing the admin UI rather than adding new endpoints.
- Helper copy shortens by default; expanded explanatory text remains accessible via mild disclosure controls if detailed guidance is needed.
