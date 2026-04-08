# Contract: Admin builder table interactions

## Inputs (from existing DB/config)

- `sections`: ordered array of `PageSectionConfig` objects stored in D1 (JSON column)  
- `formFields`: ordered list of `ContactFormFieldConfig` objects  
- `navigationItems`: ordered list of `NavigationItemConfig` objects  
- Each list is fetched by the admin loader and passed to the Astro page as props.

## UI Output

- Each list renders as a compact table row with:
  - Drag handle bound to the chosen drag-and-drop helper
  - Explicit controls (section-specific toggles, field labels, required checkbox, nav visibility)
  - Remove button that removes the entry from the active list

## Events

- `onAddEntry(listType, payload)` adds a new row at the bottom with default values.  
- `onRemoveEntry(listType, id)` removes the row from the table and the in-memory array.  
- `onReorder(listType, newOrderArray)` fires after drag-and-drop; the new array replaces the existing list's order before calling the save API.

## Persistence Contract

- Saving sends payloads with solely the ordered arrays; the backend persists them to the existing D1 tables/settings without separate sort keys.  
- The frontend must ensure the array order matches the user-visible row order before invoking the save API.
