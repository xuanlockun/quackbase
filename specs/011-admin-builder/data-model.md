# Data Model: Admin builder tables

## PageSectionConfig

- **Represents**: An active section on a page with type, localized copy, and ordering metadata used to render the live layout.
- **Attributes**:
  - `type`: string identifier for the section template (e.g., hero, CTA, testimonial)
  - `localizedTitle`: JSON object mapping language codes to titles
  - `controls`: section-specific flags exposed in the UI (language toggles, visibility)
  - `order`: implicit array position (no explicit column) used to determine placement

## ContactFormFieldConfig

- **Represents**: Each field in the contact form builder table with localized labels and requirement metadata.
- **Attributes**:
  - `fieldType`: enum/string (text, email, textarea, select, etc.)
  - `labels`: localized dictionary (JSON) for label text per language
  - `required`: boolean
  - `order`: derived from the array index in the saved field list

## NavigationItemConfig

- **Represents**: A navigation entry edited via the dense table with drag handles.
- **Attributes**:
  - `label`: localized text for the nav entry
  - `target`: path or anchor
  - `visible`: boolean or RBAC flags as already stored in D1
  - `order`: array position used to display in navigation lists
