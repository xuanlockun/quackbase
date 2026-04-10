# Language Management

This document records the admin language control surface, dropdown behavior, and routing/fallback invariants introduced in feature `010-language-management`.

## Admin Controls
- `/admin/languages` exposes every catalog entry (code, display name, enabled flag, default flag) and requires the `languages.manage` permission.
- New languages must supply a valid locale code and name; the UI prevents duplicate codes and empty names.
- Toggles for “enabled” and “default” are guarded on both client and server so that:
  - Only one language can ever have `is_default = true`.
  - At least one language stays enabled at all times.

## Dropdown & Routing
- The shared dropdown fetches all enabled languages from the D1 catalog and highlights the current choice; both the public header and admin sidebar use the same component.
- Language switching strips any existing `/{lang}` prefix before navigating, preventing duplicate segments.
- Unknown language codes or missing translations always fall back to the default language while keeping the visitor on a valid route.

## Fallback Guarantees
- Admin APIs (`POST /api/admin/languages`, `PATCH /api/admin/languages/{code}`) enforce the default/enable invariants before any write operation.
- Middleware ensures `locals.languageCatalog` is always populated and redirects unsupported prefixes to the default route, so `/en`, `/vi`, or any newly enabled language always resolve.

## Translation Entries Workspace
- `/admin/languages` now shows an **Edit translations** action for each locale that links to `/admin/languages/{locale}` so admins can work inside a dedicated translation workspace.
- The locale-specific page loads `translation_entries` filtered by the selected language, renders the key/value rows, and reuses the existing RBAC guard and `translation_manager` script to keep the UI consistent.
- The workspace exposes inline controls to add, edit, and delete translation rows, and all CRUD operations go through the shared D1 helper functions against the `translation_entries` table, keeping the flow efficient without extra infrastructure.
