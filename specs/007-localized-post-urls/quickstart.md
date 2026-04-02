# Quickstart: Localized Post URLs

## 1. Prepare the project

1. Ensure the project is on branch `007-localized-post-urls`.
2. Confirm dependencies are installed and the local workspace can run `npm test` and `npm run check`.
3. Confirm the `DB` D1 binding is available for local and deployed environments.

## 2. Apply the localized post migration

1. Create and apply a new D1 migration for localized post routing.
2. Convert `posts.slug` from scalar text into JSON-backed localized storage by wrapping existing values as:
   `{"en":"existing-slug"}`
3. Convert `posts.description` into JSON-backed localized storage if it is still scalar for any historical rows.
4. Verify `posts.title` and `posts.content` remain valid localized JSON fields after the migration.
5. Confirm existing post status, dates, and media fields remain intact.

## 3. Validate admin authoring flows

1. Open `/admin/posts/new`.
2. Confirm the form exposes editable slug, title, description, and content inputs per language.
3. Enter English and Vietnamese values and use the form control that auto-generates each language’s slug from that language’s title.
4. Save the post and reopen it from `/admin/posts/{id}/edit`.
5. Confirm both language versions load correctly and manual slug changes for one language do not overwrite the other.

## 4. Validate route resolution

1. Publish a post with English slug `dog` and Vietnamese slug `con-cho`.
2. Visit `/en/dog` and confirm the English post content renders.
3. Visit `/vi/con-cho` and confirm the Vietnamese post content renders.
4. Remove the Vietnamese description or content and confirm `/vi/con-cho` still renders with English fallback for the missing field.
5. Remove the Vietnamese slug while keeping other Vietnamese fields and confirm the fallback route behavior matches the agreed design for default-language slug fallback.

## 5. Validate legacy and compatibility behavior

1. Test a migrated historical post that previously had only a scalar slug.
2. Confirm the migrated post can still be resolved through the new language-prefixed clean route.
3. Confirm old `/blog/...` links are either redirected or otherwise handled according to implementation without exposing duplicate canonical post URLs.

## 6. Verify regression safety

1. Run `npm test`.
2. Run `npm run check`.
3. Confirm admin post lists, edit links, and frontend post links now point to the clean localized URL format.
4. Confirm invalid localized slugs return a not-found response rather than loading the wrong post.
