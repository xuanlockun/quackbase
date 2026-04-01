# Data Model: Dense Admin UI

This feature does not introduce new persisted entities or change existing database records. The design work focuses on UI presentation models and shared layout surfaces that already exist in the admin experience.

## View Models

### Admin Workspace Frame

- Purpose: Defines the persistent layout relationship between the left navigation rail and the main content region.
- Source surfaces:
  - `src/layouts/AdminLayout.astro`
  - `src/components/admin/Sidebar.astro`
  - `src/styles/global.css`
- Key attributes:
  - Sidebar width is fixed and visually stable
  - Main content spans the remaining available width
  - Layout avoids centered container constraints for authenticated admin pages
  - Visual structure is communicated without card shells

### Dense Content Surface

- Purpose: Represents a reusable admin content region styled for compact spacing and flat presentation.
- Source surfaces:
  - `src/layouts/AdminLayout.astro`
  - `src/pages/admin/*.astro`
  - `src/components/admin/*.astro`
- Key attributes:
  - Minimal external margins
  - Reduced internal padding
  - Border-based separation
  - No rounded corners or shadow emphasis

### Compact Data Table

- Purpose: Represents reusable tabular admin content with higher row density.
- Source surfaces:
  - `src/components/admin/PostTable.astro`
  - `src/pages/admin/pages.astro`
  - `src/components/admin/UserRoleTable.astro`
- Key attributes:
  - Compact row height
  - Tight cell padding
  - Clear column alignment
  - Action controls remain accessible within dense rows
- Validation rules:
  - Rows must remain readable without text overlap
  - Action area must remain operable at supported viewport sizes

### Compact Form Layout

- Purpose: Represents reusable form composition for admin editing screens with reduced vertical sprawl.
- Source surfaces:
  - `src/components/admin/PostForm.astro`
  - `src/pages/admin/pages.astro`
  - `src/pages/admin/header.astro`
  - `src/components/admin/RoleEditor.astro`
  - `src/components/admin/UserRoleTable.astro`
- Key attributes:
  - Aligned label and field grid
  - Minimal gaps between related controls
  - Reduced section spacing
  - Flat field and button treatments
- Validation rules:
  - Labels, inputs, and validation messages remain legible
  - Dense layout must not obscure submit or secondary actions

## State and Transitions

### Layout Density State

- Default state: All supported authenticated admin pages render in dense mode.
- Transition trigger: Admin page route renders within `AdminLayout`.
- Invariants:
  - Sidebar remains present on the left for supported desktop and laptop widths
  - Content region uses full remaining width
  - Shared admin controls do not reintroduce rounded or shadow-heavy presentation

### Responsive Fallback State

- Trigger: Viewport narrows below the existing admin breakpoint.
- Expected behavior:
  - Layout may stack or relax grid columns as needed
  - Dense visual language remains intact
  - Navigation and content stay readable and actionable

## Non-Persistent Relationships

- Admin Workspace Frame contains Dense Content Surfaces.
- Dense Content Surfaces may contain Compact Data Tables and Compact Form Layouts.
- Compact Data Tables and Compact Form Layouts both depend on shared admin spacing, border, and alignment tokens defined in the stylesheet.
