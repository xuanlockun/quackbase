# Quickstart: Admin CRUD Layout Refactor

## 1. Prepare the local environment

1. Confirm the current branch is `004-admin-crud-layout`.
2. Install or update dependencies with `npm install` if Bootstrap is added during implementation.
3. Ensure the local admin auth and D1-backed data environment are available so the pages, users, and roles admin routes can load real records.

## 2. Refactor the shared admin shell

1. Update `src/layouts/AdminLayout.astro` to use a sidebar plus content structure based on Bootstrap grid or flex utilities.
2. Keep the sidebar at a fixed width and make the content workspace grow to fill the remaining horizontal space.
3. Preserve the existing admin navigation visibility rules through the sidebar component.
4. Remove or reduce layout-specific custom CSS where Bootstrap utilities can express the same behavior.

## 3. Split `pages` into dedicated CRUD routes

1. Keep `/admin/pages` focused on the pages list and row actions.
2. Add `/admin/pages/new` for page creation.
3. Add `/admin/pages/[id]/edit` or the equivalent id-based edit route used by Astro route params.
4. Extract the current page form into a reusable component shared by create and edit pages.
5. Keep delete behavior accessible from the list page only.

## 4. Split `users` into dedicated CRUD routes

1. Keep `/admin/users` focused on the admin users list.
2. Add `/admin/users/new` for user creation.
3. Add `/admin/users/[id]/edit` for user editing.
4. Replace the current inline edit panel and inline create form with a reusable user form component rendered on dedicated routes.
5. Keep role assignment editing inside the shared user form component.

## 5. Split `roles` into dedicated CRUD routes

1. Keep `/admin/roles` focused on the role list and row actions.
2. Add `/admin/roles/new` for role creation.
3. Add `/admin/roles/[id]/edit` for role editing.
4. Replace the current inline create/edit panels with a reusable role form component.
5. Keep delete behavior on the list page for roles that are allowed to be deleted.

## 6. Standardize navigation and styling

1. Use links for Create and Edit actions instead of conditional rendering or inline JS panel toggles.
2. Add a visible Back link on each create and edit page that returns to the matching list route.
3. Apply Bootstrap classes such as `container-fluid`, `row`, `col`, and `d-flex` to standardize layout and density.
4. Keep visual treatment flat and compact, adding custom CSS only for sidebar width, sticky behavior, or small app-specific adjustments.

## 7. Validate the workflow end to end

1. Run `npm test`.
2. Run `npm run check`.
3. Verify `/admin/pages`, `/admin/users`, and `/admin/roles` no longer render inline create or edit workflows.
4. Verify each Create action navigates to its `/new` route.
5. Verify each Edit action navigates to its `/:id/edit` route.
6. Verify each create/edit page includes a working Back control to the corresponding list route.
7. Verify the sidebar remains fixed-width while the content area expands across the remaining page width.
8. Verify permission-restricted sessions still hide or block unavailable actions.

## Validation Status

- Verified on 2026-04-01 with `npm test`
- Verified on 2026-04-01 with `npm run check`
