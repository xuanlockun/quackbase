# Quickstart: Multilingual Content Support

## 1. Prepare the project

1. Ensure the project is on branch `005-content-i18n`.
2. Install dependencies with `npm install` if the workspace is not already bootstrapped.
3. Confirm the `DB` D1 binding is available for local and deployed environments.

## 2. Apply the multilingual content migration

1. Create and apply a D1 migration for multilingual content, for example `migrations/0003_content_i18n.sql`.
2. Update `posts.title` and `posts.content` into JSON-backed text storage for localized title and content.
3. Update `site_pages.title` and `site_pages.content` into JSON-backed text storage for localized title and content.
4. Backfill existing English-only rows so each migrated record stores at least:
   `{"en":"existing value"}`
5. Verify existing `slug`, `description`, `status`, dates, and page section fields remain intact.

## 3. Validate admin authoring flows

1. Open `/admin/posts/new`.
2. Confirm the form exposes multilingual editing for `title` and `content`.
3. Enter English and Vietnamese values, save the record, and reopen it from `/admin/posts/{id}/edit`.
4. Confirm both language versions load correctly and switching languages does not discard the other localized values.
5. Repeat the same validation for `/admin/pages/new` and `/admin/pages/{id}/edit`.

## 4. Validate admin API behavior

1. Create or update a post through the admin API and confirm the request accepts translation objects for translatable fields when sent as JSON.
2. Fetch a post detail response and confirm `titleTranslations` and `contentTranslations` are returned as parsed JSON objects rather than raw JSON strings.
3. Repeat the same validation for page create, update, and edit-loading flows.

## 5. Validate localized public routes

1. Visit `/en/blog/{slug}` for a published multilingual post and confirm English content renders.
2. Visit `/vi/blog/{slug}` and confirm Vietnamese content renders when present.
3. Remove the Vietnamese translation for one field and confirm the page falls back to the English value instead of breaking.
4. Visit `/en/{slug}` and `/vi/{slug}` for published pages and confirm the same behavior.

## 6. Verify regression safety

1. Run `npm test`.
2. Run `npm run check`.
3. Confirm existing English-only posts and pages still render through localized URLs using English fallback.
4. Confirm admin list pages remain usable after the create/edit forms adopt multilingual field handling.
