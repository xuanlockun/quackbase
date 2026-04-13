# UI Contract: Bootstrap Alignment

1. **Bootstrap Asset Contract**
   - Public and admin pages must rely on the exact Bootstrap 5.3.8 CDN `<link>` and `<script>` tags (with their integrity/crossorigin attributes) injected via `BaseHead.astro`.
2. **Layout Contract**
   - Replace existing `.admin-*`, `.dynamic-*`, and custom spacing selectors with Bootstrap containers/rows/cols, spacing utilities (`px-4`, `py-3`, etc.), and standard cards/tables so every view shares consistent layout.
3. **Interactive Contract**
   - Dropdowns, collapses, sidebars, and alerts must follow Bootstrap markup (`data-bs-*` attributes) while existing scripts (language switch, contact form) attach to the same selectors to keep behavior and ARIA support unchanged.
4. **Form/Table Contract**
   - Forms must use Bootstrap `form-control`, `form-select`, `form-check`, and consistent `btn` classes, while tables adopt `table` (with `table-striped`/`table-hover`) and `badge` utilities for statuses.
