# UI Contract: Admin CRUD Routing And Layout

## Purpose

This contract defines the observable admin UI behavior for the pages, users, and roles CRUD refactor.

## Route Contract

- Each supported entity exposes exactly three workflow route types:
  - List: `/admin/{entity}`
  - Create: `/admin/{entity}/new`
  - Edit: `/admin/{entity}/{id}/edit`
- Supported entities are:
  - `pages`
  - `users`
  - `roles`
- List routes do not render inline create or edit forms.
- Create and edit routes render a dedicated form workflow for exactly one entity record at a time.

## Navigation Contract

- Create actions are rendered as links to the dedicated `/new` route.
- Edit actions are rendered as links to the dedicated `/{id}/edit` route.
- Create and edit screens include a visible Back control that returns to the matching list route.
- Admin workflow changes are expressed through URL navigation, not by conditionally revealing hidden panels on the list screen.

## Layout Contract

- Admin pages in scope use a shared sidebar plus content structure.
- The sidebar keeps a fixed width on supported desktop and laptop widths.
- The content region grows to fill the remaining horizontal space.
- The content region does not use a centered narrow container that constrains forms or tables unnecessarily.
- Responsive behavior may stack the layout on narrower widths, but list and form content must remain readable and usable.

## Styling Contract

- Bootstrap layout and form classes provide the default structure for supported pages.
- Styling remains dense and restrained:
  - compact spacing
  - flat controls
  - minimal decorative treatments
- Custom CSS is limited to behavior Bootstrap utilities do not cover cleanly, such as fixed sidebar sizing or small app-specific adjustments.

## Reusable Form Contract

- Each supported entity has one shared form component reused by both create and edit routes.
- Shared form components accept:
  - mode (`create` or `edit`)
  - initial field values
  - submit target
  - permission-aware disabled state
  - back destination
- Shared form components do not own list-page visibility state.

## Data And Permission Contract

- Existing permission checks remain the source of truth for list, create, edit, and delete availability.
- Existing entity validation and persistence rules remain unchanged unless required for route-based loading.
- User and role write operations continue through their current admin API endpoints.
- Page writes continue through the existing admin page submission flow, with redirects aligned to dedicated create and edit routes.
- Dedicated create and edit pages submit through server-handled form posts so successful actions return to the matching list route with status feedback.

## Verification Contract

Reviewers can validate the implementation by checking:

1. `/admin/pages`, `/admin/users`, and `/admin/roles` only show list-oriented management surfaces.
2. Each Create action opens a dedicated `/new` route.
3. Each Edit action opens a dedicated `/{id}/edit` route.
4. Each create/edit page has a visible Back control to the list page.
5. The admin shell keeps a fixed-width sidebar and a full-width growing content region.
6. Bootstrap classes are the dominant layout/styling mechanism for the new screens.
