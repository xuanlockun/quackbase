# Research: Admin CRUD Layout Refactor

## Decision 1: Use route-driven CRUD pages for pages, users, and roles

- **Decision**: Implement explicit list, create, and edit routes for each entity: `/admin/{entity}`, `/admin/{entity}/new`, and `/admin/{entity}/:id/edit`.
- **Rationale**: The current `pages`, `users`, and `roles` experiences mix list and form concerns on the same screen, which makes navigation less predictable and harder to deep-link. Dedicated routes align these areas with the existing `posts` workflow and satisfy the feature's primary consistency goal.
- **Alternatives considered**:
  - Keep inline create/edit panels and toggle them with client-side state: rejected because it preserves the current inconsistency and contradicts the spec.
  - Use query parameters to switch between list/create/edit states on one route: rejected because the resulting URLs remain less clear and still couple multiple workflows into one page file.

## Decision 2: Extend `AdminLayout` into a Bootstrap-based sidebar plus flex content shell

- **Decision**: Refactor `AdminLayout.astro` to use Bootstrap layout primitives such as `container-fluid`, `row`, `col`, and `d-flex`, with a fixed-width sidebar rail and a flex-growing content region.
- **Rationale**: The feature explicitly asks for Bootstrap basic components and a content area that fills the remaining horizontal space. Bootstrap's layout utilities cover most of the needed structure while reducing one-off layout rules.
- **Alternatives considered**:
  - Keep the current custom class-only layout: rejected because it misses the requested Bootstrap direction and retains more custom layout burden than necessary.
  - Move to CSS Grid-only custom layout rules: rejected because the feature asks to standardize on Bootstrap grid or flexbox patterns and minimize custom styling.

## Decision 3: Prefer shared per-entity form components over embedding forms in route files

- **Decision**: Create reusable form components for pages, users, and roles, with each dedicated create/edit route passing mode, initial values, action targets, permission-aware state, and back-link behavior into the shared form surface.
- **Rationale**: Create and edit screens for a given entity share field definitions, validation expectations, and action affordances. Reusable forms keep behavior aligned while leaving route files responsible for data loading and page framing.
- **Alternatives considered**:
  - Duplicate form markup into each `new` and `edit` route: rejected because it increases drift risk and makes future field changes more expensive.
  - Keep all form markup inside the existing list components and try to reuse those components across routes: rejected because those components are currently coupled to inline workflow behavior.

## Decision 4: Keep navigation link-based and use simple back links as the default control

- **Decision**: Use normal links for Create, Edit, and Back navigation, with the Back control targeting the corresponding list route directly rather than relying on conditional rendering or mandatory `history.back()` logic.
- **Rationale**: The feature specifically asks for navigation via links instead of conditional rendering. A plain link is predictable for deep links, works without client-side assumptions, and still satisfies the requirement for a visible way back to the list page.
- **Alternatives considered**:
  - Use `history.back()` as the only back behavior: rejected because direct visits to create/edit routes may not have useful in-app history.
  - Implement client-side router state to remember the previous admin page: rejected because Astro's server-rendered route model does not need extra client-side navigation state for this workflow.

## Decision 5: Reuse existing mutation APIs and minimize backend changes

- **Decision**: Keep current user and role JSON mutation endpoints and the current page form-post endpoint as the authoritative write interfaces, adding only the route-level loading or response shaping needed to support dedicated create/edit pages.
- **Rationale**: This feature is about frontend workflow structure and layout, not a backend contract redesign. The current APIs already support the required entity operations, so the safest plan is to reuse them and focus changes on page composition.
- **Alternatives considered**:
  - Redesign all CRUD endpoints into a new unified API format: rejected because it broadens scope and risks regressions unrelated to the UX goal.
  - Move all create/edit handling fully client-side with fetch-first rendering: rejected because the existing Astro pages already support server-side data loading patterns and do not require a full SPA model.

## Decision 6: Move admin surface styling toward Bootstrap classes with only narrow shared CSS support

- **Decision**: Replace one-off inline styles and ad hoc admin panel classes with Bootstrap utility classes and basic component classes wherever possible, keeping only small shared CSS rules for app-specific needs such as sidebar width, sticky behavior, and compact theme alignment.
- **Rationale**: The user explicitly asked to avoid custom CSS unless necessary. Bootstrap handles spacing, layout, tables, forms, and button structure well enough for this dense admin refactor, while a small amount of shared CSS can preserve the existing brand-neutral admin tone.
- **Alternatives considered**:
  - Keep extensive admin-specific CSS and just rename classes: rejected because it would not reduce styling sprawl or align with the requested Bootstrap direction.
  - Use Bootstrap wholesale with no app-specific CSS at all: rejected because the sidebar width and some admin-specific density adjustments still need a small amount of shared customization.
