# Research: Dense Admin UI

## Decision 1: Centralize density rules in shared admin layout and stylesheet

- Decision: Apply the density refactor through shared admin CSS primitives in `src/styles/global.css` and the shared frame in `src/layouts/AdminLayout.astro`, then use targeted component adjustments only where markup structure prevents the shared rules from taking effect cleanly.
- Rationale: The current admin experience already relies on shared classes such as `admin-shell`, `admin-panel`, `admin-form-stack`, `admin-form-grid`, and `admin-table`. Adjusting those primitives will produce consistent density improvements across posts, pages, roles, users, and site-settings screens without creating per-page styling drift.
- Alternatives considered:
  - Restyle each admin page individually. Rejected because it would duplicate spacing logic and likely create inconsistent density across routes.
  - Introduce a separate dense theme stylesheet. Rejected because the feature replaces the existing admin presentation rather than adding a second theme mode.

## Decision 2: Use flat bordered surfaces instead of glass, gradients, cards, and shadows

- Decision: Replace backdrop blur, large border radii, gradients, and drop shadows on admin surfaces with flat backgrounds, square edges, subtle borders, and compact separators.
- Rationale: The current admin shell uses rounded panels, layered gradients, and shadow treatments that visually inflate the interface and consume space. A flat border-led system better matches the requested CMS-style professional density while still preserving structure and hierarchy.
- Alternatives considered:
  - Keep decorative treatments and only reduce padding. Rejected because visual chrome would still make the interface feel spacious and card-oriented.
  - Remove all separation styling entirely. Rejected because dense layouts still need strong alignment and borders to remain readable.

## Decision 3: Treat the fixed sidebar as a strict-width navigation rail

- Decision: Keep the left sidebar as a persistent fixed-width navigation rail and ensure the content column expands to the remaining available width with no admin container max-width cap.
- Rationale: The spec and user rules both emphasize a fixed sidebar and full-width content. The current layout uses a bounded shell width and sticky sidebar treatment that still feels panelized. Converting the sidebar into a stricter rail while letting content fill the remaining width directly supports higher information density.
- Alternatives considered:
  - Preserve the current centered shell with a large maximum width. Rejected because it leaves unused horizontal space on wider screens.
  - Collapse the sidebar into a top navigation pattern on desktop. Rejected because it conflicts with the requested CMS-style layout.

## Decision 4: Use compact tables and forms as reusable admin primitives

- Decision: Define compact table and form rules once and apply them across `PostTable`, the page editor screen, role/user editors, and header/footer settings.
- Rationale: Tables and forms are the primary admin work surfaces. The current codebase mixes shared admin classes with component-local styles that still create roomy rows, padded field groups, and nested card sections. Shared compact primitives will give the feature a consistent operational feel and reduce maintenance cost.
- Alternatives considered:
  - Only optimize the posts screen first. Rejected because the spec explicitly calls for consistency across supported admin page types.
  - Shrink text instead of spacing. Rejected because the goal is higher density with preserved readability, not simply smaller typography.

## Decision 5: Preserve current behavioral tests and add targeted manual UI validation criteria

- Decision: Rely on existing automated tests for auth and API behavior, and use documented manual verification on admin routes to confirm layout density, fixed-sidebar behavior, and absence of rounded/card styling.
- Rationale: The feature is presentational and does not change RBAC or CRUD APIs. Existing automated tests already cover the highest-risk behavioral areas, while the new acceptance concerns are visual and structural.
- Alternatives considered:
  - Add new automated browser-level visual tests immediately. Rejected because the repository does not currently include a browser automation stack for visual assertions.
  - Skip validation beyond local review. Rejected because the spec defines measurable layout outcomes that still need explicit verification steps.
