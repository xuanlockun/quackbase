# Research: Admin Builder UX Tables

## Decision 1: Table-based drag-and-drop for page sections

- **Decision**: Replace the checkbox + manual order input combo with a dedicated table where each enabled section occupies a row with a drag handle, section-specific controls, and an explicit remove action.
- **Rationale**: Admins need to see the active sections in one ordered list; a table-with-drag handles delivers that clarity while eliminating error-prone numeric inputs.
- **Alternatives considered**: Keeping the current checkboxes/order inputs or adding inline sliders. Both kept stale sections hidden or still required manual order edits, so the table wins for clarity and control.

## Decision 2: Dense contact form field table

- **Decision**: Use the same compact table pattern for contact form fields, with each row providing field type, localized labels, required toggle, drag handle, and remove action.
- **Rationale**: Consistency across sections and form fields reduces cognitive load; localized labels stay editable while order derives from row position, matching the new ordering UX.
- **Alternatives considered**: Retaining manual order inputs per row or splitting form fields into cards. Those approaches kept the old order controls or consumed too much vertical space, so they were rejected.

## Decision 3: Navigation and helper text simplification

- **Decision**: Keep the existing navigation table and add-row flow but layer in drag-and-drop ordering; default helper copy (contentAndAccessManagement, etc.) is reduced to concise titles unless expanded.
- **Rationale**: Navigation already had row-based editing, so adding drag handles is the least disruptive path, while trimmed helper copy keeps the admin surface dense.
- **Alternatives considered**: Rebuilding navigation as a new panel or keeping verbose helper text. Those added complexity or visual noise, so the compact, draggable table is the chosen path.
