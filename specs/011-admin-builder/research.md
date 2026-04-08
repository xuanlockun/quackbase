# Research: Admin builder table UX

## Decision 1: Drag-and-drop approach for admin tables

- **Decision**: Use a minimal drag-and-drop helper (e.g., SortableJS or a thin HTML5 wrapper) to manage row reordering in the Astro admin tables for sections, contact form fields, and navigation items.
- **Rationale**: SortableJS is framework-agnostic, small enough for Cloudflare Workers, and exposes events for persisting the new array order without re-rendering entire panels.
- **Alternatives considered**:
  1. Native HTML5 drag-and-drop – too verbose for multi-row tables and tricky to keep synchronized with backend data.
  2. Heavy UI frameworks (React/Vue) – not aligned with the existing Astro/TypeScript stack and would bloat the admin bundle.

## Decision 2: Persist ordered arrays instead of numeric sort fields

- **Decision**: Normalize the order by saving the current array of active sections/fields/navigation items back to D1 (JSON/text column) so position equals array index.
- **Rationale**: The admin spec explicitly removes manual number inputs; storing a single ordered array mirrors the table UI and avoids maintaining separate sort columns.
- **Alternatives considered**:
  1. Keep numeric `order` columns – would force admins to re-enter numbers, contradicting the drag-and-drop goal.
  2. Store per-row metadata (timestamp) – unnecessary complexity given existing D1 schema already handles JSON columns for localized content.
