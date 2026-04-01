# Research: Admin UI Refactor

## Decision 1: Use a shared Astro `AdminLayout` for all authenticated admin pages in scope

- **Decision**: Create a reusable `AdminLayout` component that owns the admin shell, including the fixed left sidebar, content container, consistent spacing, shared page chrome, and admin-only navigation framing.
- **Rationale**: The current admin pages repeat layout structure and mix page-specific concerns with shell concerns. Centralizing the shell makes the posts list, create page, and edit page visually consistent and makes it easier to migrate the rest of the admin area later.
- **Alternatives considered**:
  - Keep page-local layout markup in each admin route: rejected because it would duplicate spacing, sidebar, and container logic across files.
  - Reuse the public `Header` plus ad hoc admin wrappers: rejected because the feature explicitly removes the top navigation bar from the admin experience.

## Decision 2: Split post management into URL-driven pages instead of conditional rendering on `/admin/posts`

- **Decision**: Implement three dedicated page routes for post workflows: `/admin/posts`, `/admin/posts/new`, and `/admin/posts/:id/edit`.
- **Rationale**: The feature goal is separation of concerns by page. Dedicated routes make the workflow predictable, improve deep linking, simplify back navigation, and remove the need to overload the list view with create/edit responsibilities.
- **Alternatives considered**:
  - Keep one route and switch views based on query params: rejected because it preserves the current coupled mental model and makes the URL less descriptive.
  - Render create/edit in modal overlays from the list page: rejected because the feature asks for dedicated pages with one primary component per page.

## Decision 3: Reuse one `PostForm` component for both create and edit with route-provided initial state

- **Decision**: Build a shared `PostForm` component that accepts mode (`create` or `edit`), initial field values, submit target, and permission-aware UI state, then use it from both dedicated form pages.
- **Rationale**: Create and edit pages share nearly all fields, validation expectations, and save affordances. One form component keeps behavior aligned while still letting each page control its own heading, back action, and post-load error state.
- **Alternatives considered**:
  - Separate create and edit form components: rejected because it duplicates field markup and validation behavior.
  - Keep the current inline form in the page file: rejected because it ties form rendering to one route and makes reuse harder.

## Decision 4: Introduce API-backed reads for posts list and individual post detail

- **Decision**: Add or extend admin post APIs so the UI can fetch the posts collection for `/admin/posts` and a single post record for `/admin/posts/:id/edit`, while continuing to submit create/update actions through admin API routes.
- **Rationale**: The planning input explicitly calls for fetching posts from the API and handling create/update via API. Adding dedicated read endpoints keeps the pages aligned with that model and decouples UI rendering from direct database reads in route files.
- **Alternatives considered**:
  - Continue loading data only through `src/lib/blog.ts` directly inside page files: rejected because it does not satisfy the API-backed state requirement.
  - Fetch the full posts collection on every page and derive the selected record client-side: rejected because the edit page only needs one post and should not depend on the list payload.

## Decision 5: Implement the back action as a history-aware control with a safe route fallback

- **Decision**: Use a back control that prefers browser history when available and falls back to `/admin/posts` when there is no meaningful history entry.
- **Rationale**: This satisfies the request for a router/history-based back action while keeping navigation reliable for direct deep links and first-load visits to create/edit routes.
- **Alternatives considered**:
  - Plain anchor link only: rejected because it ignores the requested history-aware behavior.
  - `history.back()` with no fallback: rejected because direct navigation to deep links could send users away from the admin workflow or do nothing meaningful.

## Decision 6: Preserve current permission guards and only change how navigation exposes them

- **Decision**: Keep the existing RBAC guards and permission checks as the source of truth, and update page navigation and action visibility so links to create/edit routes appear only when the current admin session is allowed to use them.
- **Rationale**: The feature is a UX and workflow refactor, not a permission-system redesign. Reusing the existing access model avoids scope creep and protects behavior already covered by the earlier admin auth feature.
- **Alternatives considered**:
  - Rewrite permission logic while refactoring the UI: rejected because it would combine two risky changes in one feature.
  - Expose all links and rely only on server rejection: rejected because the spec requires clearer navigation and better usability, not just backend enforcement.
