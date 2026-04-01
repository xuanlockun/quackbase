# Quickstart: Dense Admin UI

## Goal

Implement and validate a denser admin workspace with a fixed-width left sidebar, full-width content area, flat surfaces, compact tables, and compact forms.

## Files to Touch First

1. `D:\Projects\edge_cms\astro-blog-starter-template\src\styles\global.css`
2. `D:\Projects\edge_cms\astro-blog-starter-template\src\layouts\AdminLayout.astro`
3. `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\Sidebar.astro`
4. `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostTable.astro`
5. `D:\Projects\edge_cms\astro-blog-starter-template\src\components\admin\PostForm.astro`

## Recommended Implementation Order

1. Refactor shared admin shell styles.
   - Remove admin rounded corners and shadow-heavy treatments.
   - Remove admin max-width constraints and ensure content fills the remaining width.
   - Tighten global admin spacing, headers, notices, buttons, and stack gaps.

2. Refine the sidebar as a fixed-width navigation rail.
   - Reduce sidebar padding.
   - Remove decorative grouped cards inside the sidebar.
   - Keep active-state clarity with borders and background only.

3. Compact shared form and table primitives.
   - Reduce row and cell padding in `.admin-table`.
   - Tighten `.admin-form-stack`, `.admin-form-grid`, and field control spacing.
   - Ensure buttons and inline actions remain usable.

4. Remove page-local card wrappers that fight the dense layout.
   - Review `src/pages/admin/pages.astro`, `src/pages/admin/header.astro`, `src/components/admin/RoleEditor.astro`, and `src/components/admin/UserRoleTable.astro`.
   - Replace nested card treatments with flat sections or shared compact wrappers.

5. Verify responsive behavior.
   - Confirm layout remains readable at the existing admin breakpoint.
   - Ensure reduced spacing does not create clipped text or inaccessible actions.

## Validation Steps

1. Run `npm test`.
2. Run `npm run build`.
3. Manually inspect:
   - `/admin/posts`
   - `/admin/posts/new`
   - `/admin/posts/[id]/edit`
   - `/admin/pages`
   - `/admin/header`
   - `/admin/roles`
   - `/admin/users`
4. Confirm:
   - no rounded admin surfaces
   - no card-dominant wrappers
   - denser tables and forms
   - fixed left sidebar
   - full-width content region
   - readable responsive fallback
