# Quickstart: Emdash-Inspired Admin UI Refactor

## Goal

Deliver a more polished admin experience that feels structurally close to Emdash while preserving all current Astro routes, RBAC rules, and backend behavior.

## Recommended Execution Sequence

1. Review the current shared admin shell in `src/layouts/AdminLayout.astro` and `src/components/admin/Sidebar.astro`.
2. Update the shell and sidebar first so the global frame changes are visible immediately.
3. Normalize the page header pattern used by admin routes such as `src/pages/admin/posts.astro`, `src/pages/admin/pages.astro`, `src/pages/admin/users.astro`, `src/pages/admin/roles.astro`, and `src/pages/admin/header.astro`.
4. Unify list surfaces in `src/components/admin/PostTable.astro`, `src/components/admin/PageTable.astro`, `src/components/admin/RoleTable.astro`, and `src/components/admin/UserTable.astro`.
5. Unify editor surfaces in `src/components/admin/PostForm.astro`, `src/components/admin/PageForm.astro`, `src/components/admin/RoleForm.astro`, and `src/components/admin/UserForm.astro`.
6. Tighten shared spacing and responsive polish in `src/styles/global.css`.

## Baseline Screens

Use these routes for visual comparison while iterating on the admin shell:

- `src/pages/admin/index.astro`
- `src/pages/admin/posts.astro`
- `src/pages/admin/posts/new.astro`
- `src/pages/admin/posts/[id]/edit.astro`
- `src/pages/admin/pages.astro`
- `src/pages/admin/pages/new.astro`
- `src/pages/admin/pages/[id]/edit.astro`
- `src/pages/admin/roles.astro`
- `src/pages/admin/roles/new.astro`
- `src/pages/admin/roles/[id]/edit.astro`
- `src/pages/admin/users.astro`
- `src/pages/admin/users/new.astro`
- `src/pages/admin/users/[id]/edit.astro`
- `src/pages/admin/header.astro`
- `src/pages/admin/languages.astro`
- `src/pages/admin/languages/[locale].astro`
- `src/pages/admin/permissions.astro`

## Verification Checklist

- Confirm desktop admin screens share the same shell, spacing, and page header pattern.
- Confirm sidebar visibility and active-state clarity on all main admin routes.
- Confirm mobile navigation works without hiding the current context.
- Confirm tables, cards, badges, and forms feel like one system.
- Run `npm test` and note whether Vitest worker spawning is permitted in the current environment.
- Run `npm run build` with telemetry disabled if the sandbox blocks Astro telemetry state creation.

## Notes

- No database migration is expected for this feature.
- No route changes are expected for this feature.
- If a screen needs a special layout exception, document the reason before implementing it so the shared shell stays consistent.
- Current validation in this environment can fail on Vitest worker spawning or Astro telemetry file creation even when the code is healthy; use the successful build output as the primary implementation check.
