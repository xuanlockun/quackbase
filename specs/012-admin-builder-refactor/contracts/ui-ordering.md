# UI Contract: Admin Builder Table Ordering

## Overview

The admin builder exposes three dense tables (sections, contact form fields, navigation items). Each row includes a drag handle, row-specific controls, and a remove action; explicit add buttons insert new rows into each table.

## Behavior

- Dragging a row updates the visual order immediately and writes the new array order to the corresponding D1-backed payload when the admin saves.
- Removing a row deletes it from the ordered array, ensuring it no longer renders in the table or persists in the activated list.
- Adding a row appends a new entry with default metadata; the admin can then edit the specific controls (section settings, field type/labels, navigation label/target) before saving.
- Helper copy (e.g., contentAndAccessManagement) defaults to rendering only the block title unless the admin explicitly expands it, keeping screens compact.

## Inputs/Outputs

- **Input**: Existing ordered arrays from D1 tables (`sections`, `contact_form_fields`, `navigation_items`) and helper copy metadata.
- **Output**: Same arrays rewritten in the order shown in the tables; order is derived from array indices (no numeric fields are persisted).
- **Validation**: Each row must carry the minimal required metadata (section type, localized field labels, navigation label/target) before the save transition.
