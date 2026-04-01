# UI Contract: Dense Admin UI

## Purpose

This contract defines the observable UI behaviors that the dense admin refinement must preserve across supported authenticated admin pages.

## Layout Contract

- Admin pages using `AdminLayout` expose a two-region workspace:
  - Left navigation rail
  - Main content region
- The left navigation rail remains visually anchored on the left for supported desktop and laptop widths.
- The main content region consumes the remaining horizontal space and does not use a centered max-width content container.
- Primary page structure is communicated with alignment, borders, headers, and separators rather than card shells.

## Styling Contract

- Shared admin surfaces do not use rounded corners.
- Shared admin surfaces do not use decorative shadows as a primary means of separation.
- Shared admin spacing is compact:
  - Large padding blocks are removed
  - Margins between related controls are reduced
  - Forms and tables use tighter row and field spacing
- Sidebar, tables, buttons, notices, and forms follow the same flat visual system.

## Table Contract

- Data tables remain full-width within their content region.
- Header and body rows use compact spacing that increases visible data density.
- Each row preserves:
  - readable title and metadata text
  - visible status indication
  - accessible row actions
- Overflow handling may scroll horizontally when necessary, but dense styling must not cause clipped controls or overlapping text.

## Form Contract

- Form labels and controls align to a compact grid.
- Inputs, selects, textareas, and action buttons use minimal spacing and flat edges.
- Primary and secondary form actions remain visible and understandable without relying on oversized containers or decorative grouping.
- Validation and status messaging stay legible in the denser layout.

## Sidebar Contract

- Sidebar width is fixed and consistent across supported admin routes.
- Sidebar items use flat active and inactive states without rounded pills or raised effects.
- Sidebar content remains scannable even after reducing padding and decorative copy weight.

## Verification Contract

Reviewers can validate the implementation by checking:

1. `src/layouts/AdminLayout.astro` pages fill available width beside the sidebar.
2. `src/styles/global.css` no longer defines rounded/shadow-heavy admin surface treatments as the default admin language.
3. Admin posts, pages, and settings screens show more actionable content above the fold than before.
4. Dense styling is shared across pages rather than recreated with isolated one-off rules.
