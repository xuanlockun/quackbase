# Data Model: Admin Builder UX Tables

## Page Section

- **Attributes**: `sectionId`, `sectionType`, `orderIndex`, `settingsPayload` (JSON to drive section-specific controls), `enabled` flag implied by presence in the ordered list.
- **Relationships**: Stored as ordered entries inside the page builder payload; orderIndex equals the row position after drag-and-drop.
- **Validation rules**: Each `sectionType` must match the catalog of known components and include any required metadata before persistence.

## Contact Form Field

- **Attributes**: `fieldId`, `fieldType`, `localizedLabels` (a JSON map per locale), `required` (bool), `orderIndex`.
- **Storage**: Persists in the shared contact form settings table/JSON column inside D1; order is derived from array position only.
- **State transitions**: Rows can be added (append), reordered (adjust orderIndex), toggled required, and removed.

## Navigation Item

- **Attributes**: `itemId`, `label`, `targetUrl`, `orderIndex`, `isActive`.
- **Behavior**: Drag-and-drop updates `orderIndex` so the persisted array reflects the new sequence; no manual numeric input is stored.

## Admin Copy Block

- **Attributes**: `blockId`, `title`, `body` (optional), `isExpanded`.
- **Purpose**: Provides helper copy such as contentAndAccessManagement; by default only `title` renders unless `isExpanded` true.
