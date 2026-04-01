# Edge CMS with Astro + D1

This project started from the Astro blog starter and has been converted into a runtime CMS.

Published posts are now stored in Cloudflare D1 and rendered on request, so content changes can go live immediately without waiting for a rebuild or redeploy.

## What changed

- `/blog` loads published posts from D1
- `/blog/[slug]` renders Markdown from D1 with `micromark`
- `/admin` is a page-oriented CMS dashboard with a dedicated admin sidebar
- `/admin/posts` is a table-only post management view
- `/admin/posts/new` and `/admin/posts/:id/edit` provide dedicated post forms
- `/admin/pages`, `/admin/users`, and `/admin/roles` are now list-only CRUD index routes
- `/admin/pages/:id/edit`, `/admin/users/:id/edit`, and `/admin/roles/:id/edit` provide dedicated edit views
- `/admin/pages/new`, `/admin/users/new`, and `/admin/roles/new` provide dedicated create views
- `/api/admin/*` contains the auth and post management handlers used by the admin UI
- `src/content/blog/` is still in the repo as sample starter content, but it is no longer the live source of truth

## Required setup

### 1. Create a D1 database

```bash
npx wrangler d1 create edge-cms
```

Take the returned `database_id` and add a `d1_databases` binding named `DB` to `wrangler.json`.

Example shape:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "edge-cms",
      "database_id": "REPLACE_ME"
    }
  ]
}
```

### 2. Apply the schema

```bash
npx wrangler d1 execute edge-cms --local --file=./migrations/0001_create_posts.sql
npx wrangler d1 execute edge-cms --remote --file=./migrations/0001_create_posts.sql
```

### 3. Set the admin token

For local dev:

```bash
$env:CMS_ADMIN_TOKEN="change-me"
```

For deployed environments:

```bash
npx wrangler secret put CMS_ADMIN_TOKEN
```

If `CMS_ADMIN_TOKEN` is not set, the admin UI is left open. Set it for any real deployment.

## Main routes

- `/` landing page
- `/blog` public post index
- `/blog/:slug` public post page
- `/admin` CMS dashboard
- `/admin/login` admin login page
- `/admin/posts` post list page
- `/admin/posts/new` create post page
- `/admin/posts/:id/edit` edit post page
- `/admin/pages` page list page
- `/admin/pages/new` create page route
- `/admin/pages/:id/edit` edit page route
- `/admin/users` user list page
- `/admin/users/new` create user route
- `/admin/users/:id/edit` edit user route
- `/admin/roles` role list page
- `/admin/roles/new` create role route
- `/admin/roles/:id/edit` edit role route

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro locally |
| `npm run build` | Build the project |
| `npm run preview` | Build and preview with Wrangler |
| `npm run deploy` | Deploy to Cloudflare |

## Important files

- `src/lib/blog.ts` D1 queries, Markdown rendering, auth helpers, and admin post serializers
- `src/layouts/AdminLayout.astro` shared admin shell
- `src/pages/admin/index.astro` CMS dashboard redirect
- `src/pages/admin/posts.astro` table-only posts list
- `src/pages/admin/posts/new.astro` dedicated post creation page
- `src/pages/admin/posts/[id]/edit.astro` dedicated post editing page
- `src/pages/admin/pages.astro`, `src/pages/admin/users.astro`, and `src/pages/admin/roles.astro` list-only CRUD index pages
- `src/pages/admin/pages/[id]/edit.astro`, `src/pages/admin/users/[id]/edit.astro`, and `src/pages/admin/roles/[id]/edit.astro` dedicated edit pages
- `src/components/admin/PageForm.astro`, `src/components/admin/UserForm.astro`, and `src/components/admin/RoleForm.astro` shared per-entity forms
- `src/pages/api/admin/posts.ts` post list and create handler
- `src/pages/api/admin/posts/[id].ts` post detail and update handler
- `src/pages/api/admin/posts/delete.ts` delete handler
- `src/pages/blog/index.astro` public blog listing
- `src/pages/blog/[...slug].astro` runtime post rendering
- `migrations/0001_create_posts.sql` initial posts schema

## Notes

- The CMS stores the post body as Markdown in D1 and renders it to HTML at request time.
- The admin post workflow is route-driven instead of stacking list and editor states in one page.
- The admin pages, users, and roles workflows also use dedicated list, create, and edit routes with a shared sidebar layout.
- The starter Markdown content in `src/content/blog/` is still available if you want to reference or migrate it manually.
- `npm run build` succeeds, but actual CRUD usage requires the `DB` binding to exist at runtime.
