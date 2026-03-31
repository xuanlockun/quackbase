# Edge CMS with Astro + D1

This project started from the Astro blog starter and has been converted into a runtime CMS.

Published posts are now stored in Cloudflare D1 and rendered on request, so content changes can go live immediately without waiting for a rebuild or redeploy.

## What changed

- `/blog` loads published posts from D1
- `/blog/[slug]` renders Markdown from D1 with `micromark`
- `/admin` is a basic CMS dashboard for creating, editing, publishing, and deleting posts
- `/api/admin/*` contains the form handlers for login and post management
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

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro locally |
| `npm run build` | Build the project |
| `npm run preview` | Build and preview with Wrangler |
| `npm run deploy` | Deploy to Cloudflare |

## Important files

- `src/lib/blog.ts` D1 queries, Markdown rendering, auth helpers
- `src/pages/admin/index.astro` CMS dashboard
- `src/pages/api/admin/posts.ts` create/update handler
- `src/pages/api/admin/posts/delete.ts` delete handler
- `src/pages/blog/index.astro` public blog listing
- `src/pages/blog/[...slug].astro` runtime post rendering
- `migrations/0001_create_posts.sql` initial posts schema

## Notes

- The CMS stores the post body as Markdown in D1 and renders it to HTML at request time.
- The starter Markdown content in `src/content/blog/` is still available if you want to reference or migrate it manually.
- `npm run build` succeeds, but actual CRUD usage requires the `DB` binding to exist at runtime.
