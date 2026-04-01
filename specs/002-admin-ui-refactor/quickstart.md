# Quickstart: Admin UI Refactor

## 1. Prepare the local environment

1. Install dependencies with `npm install` if they are not already present.
2. Confirm the current branch is `002-admin-ui-refactor`.
3. Ensure the existing D1 binding and admin auth environment are available so the admin routes can load real post data.

## 2. Implement the shared admin shell

1. Create `src/layouts/AdminLayout.astro` for the authenticated admin page frame.
2. Move the left-side navigation into a reusable sidebar component under `src/components/admin/`.
3. Remove the public top navigation/header from admin pages covered by this feature.
4. Apply consistent spacing and content-width rules so each admin page has one clearly dominant task area.

## 3. Split post management into dedicated routes

1. Keep `/admin/posts` as the posts list route.
2. Add `/admin/posts/new` for post creation.
3. Add `/admin/posts/[id]/edit` for post editing.
4. Replace conditional rendering and query-param-driven editor selection with route-based navigation links.
5. Keep `/admin/posts` focused on the posts table only.

## 4. Build shared post management components

1. Add `PostTable` for rendering the list page's posts table and row actions.
2. Add `PostForm` for shared create/edit fields, labels, and submit behavior.
3. Add a history-aware back button pattern with `/admin/posts` as a fallback destination.

## 5. Expose the required post workflow APIs

1. Provide an admin API endpoint to fetch the posts collection for `/admin/posts`.
2. Provide an admin API endpoint to fetch one post by id for `/admin/posts/[id]/edit`.
3. Keep create submission in `POST /api/admin/posts` and edit submission in `POST /api/admin/posts/{id}` while preserving existing permission checks.
4. Preserve delete behavior from the list page while updating redirects or feedback destinations to match the new page structure.

## 6. Validate the workflow end to end

1. Run `npm test`.
2. Run `npm run check`.
3. Verify `/admin/posts` shows only the posts table plus status feedback and row actions.
4. Verify `Create Post` links to `/admin/posts/new`.
5. Verify `Edit Post` links to `/admin/posts/{id}/edit`.
6. Verify the create and edit pages render the same shared form component with a working back action.
7. Verify users without create or update permission do not see or cannot use those workflows.
8. Verify a missing post id on the edit route shows a clear failure state with a path back to `/admin/posts`.
