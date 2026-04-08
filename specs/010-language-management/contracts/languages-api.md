# Contracts: Languages API

## Overview

The admin UI and public dropdown share a read/write contract with the backend through Cloudflare Workers endpoints. All admin requests require RBAC guarding; the public dropdown uses a read-only route.

## Endpoints

- `GET /api/languages`
  - **Purpose**: Return all enabled languages plus metadata for dropdown rendering.
  - **Response**: `[{ code, name, enabled, is_default }]`
  - **Behavior**: Filters where `enabled = true`, sorts by `code`, and flags the one where `is_default = true`.

- `GET /api/admin/languages`
  - **Purpose**: Populate the admin table with every language, even disabled ones.
  - **Authorization**: RBAC guard for admin role.
  - **Response**: `[{ code, name, enabled, is_default }]`

- `POST /api/admin/languages`
  - **Body**: `{ code, name, enabled, is_default }`
  - **Behavior**: Creates a new language, enforcing `code` uniqueness and the "only one default" rule.
  - **Validation**: Rejects if duplicate `code` exists; if `is_default = true`, clears previous default.

- `PATCH /api/admin/languages/{code}`
  - **Body**: Partial updates for `name`, `enabled`, `is_default`.
  - **Behavior**: Updates the specified language and enforces the default/enable invariants.
  - **Validation**: Prevents disabling the last enabled language.

- `POST /api/admin/languages/{code}/set-default`
  - **Purpose**: Convenience endpoint to mark a language as default while unsetting the previous one.
  - **Behavior**: Must return the new default entry; other languages now have `is_default = false`.

## Routing Helper Contract

- `switchLang(currentUrl, targetCode)` (client-side logic)
  - **Input**: Current browser URL, selected `code`.
  - **Behavior**: Replaces the `/lang` prefix with `targetCode`, avoiding duplicate prefixes. If `targetCode` is not enabled, resolves to the current default's prefix.
  - **Fallback**: On invalid language codes or missing translations, reroute to default-language copy while keeping the valid prefix.
