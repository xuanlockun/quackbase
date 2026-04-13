# Implementation Plan: Emdash-Inspired Admin UI Refactor

**Branch**: `017-emdash-admin-ui` | **Date**: 2026-04-13 | **Spec**: [`spec.md`](./spec.md)
**Input**: Feature specification from [`/specs/017-emdash-admin-ui/spec.md`](./spec.md)

## Summary

Refine the Astro admin experience to closely match the Emdash admin shell and interaction language while keeping all routes, RBAC, and backend behavior intact. The work is admin-only first, Bootstrap-first, and structured to deliver visible gains quickly by reshaping the shell before harmonizing CRUD screens, forms, tables, and interactive polish.

## Technical Context

**Language/Version**: TypeScript 5.9, Astro 5, Node.js 22  
**Primary Dependencies**: Bootstrap 5, `@astrojs/cloudflare`, Wrangler, existing admin Astro layouts/components, shared i18n and RBAC helpers  
**Storage**: Cloudflare D1 SQLite for existing admin data; no schema changes required for the UI refactor  
**Testing**: Existing `npm test` and `npm run lint`, plus manual visual verification across admin routes and responsive breakpoints  
**Target Platform**: Cloudflare Workers runtime with Astro-rendered admin pages  
**Project Type**: Web application  
**Performance Goals**: No regression in route responsiveness or admin interaction flow; shell and CRUD views should feel noticeably denser and more consistent without adding navigation lag  
**Constraints**: Preserve current routes, permissions, session behavior, and backend actions; keep Bootstrap as the implementation foundation; limit custom CSS to shell polish and density adjustments  
**Scale/Scope**: Admin UI only, spanning the shared admin shell plus representative CRUD screens for posts, pages, users, roles, settings, and related actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The current constitution file is a placeholder template rather than a project-specific policy document, so there are no actionable constitution conflicts to resolve for this admin UI plan.

## Project Structure

### Documentation (this feature)

```text
specs/017-emdash-admin-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/        # not expected for this internal UI-only refactor
```

### Source Code (repository root)

```text
src/
├── layouts/
│   └── AdminLayout.astro
├── components/
│   └── admin/
│       ├── Sidebar.astro
│       ├── PostTable.astro
│       ├── PageTable.astro
│       ├── RoleTable.astro
│       ├── UserTable.astro
│       ├── PostForm.astro
│       ├── PageForm.astro
│       ├── RoleForm.astro
│       ├── UserForm.astro
│       └── related admin helpers
├── pages/
│   └── admin/
│       ├── index.astro
│       ├── posts.astro
│       ├── pages.astro
│       ├── roles.astro
│       ├── users.astro
│       ├── header.astro
│       └── detail/create/edit routes under admin/
└── styles/
    └── global.css

tests/
├── integration/
└── contract/
```

**Structure Decision**: This is a single Astro web application. The plan stays inside the existing `src/` tree and updates shared admin layouts/components first, then the pages that consume them. No separate backend/frontend split is needed because the admin shell, CRUD screens, and session/RBAC behavior are already co-located in the current app.

## Phase 0: Research & Translation Decisions

### Admin Shell Direction

- Decision: Make `AdminLayout.astro` the primary shell boundary and treat the sidebar, top bar, and page header as one coherent workspace.
- Rationale: The Emdash target is shell-driven, so visible progress comes fastest from making the shared layout feel intentional before touching individual CRUD screens.
- Alternatives considered: Refactoring individual pages first would improve isolated screens but would leave the shell fragmented and delay the most visible change.

### Styling Approach

- Decision: Keep Bootstrap as the base system and use only targeted custom CSS for sidebar surface treatment, density, and subtle interaction polish.
- Rationale: The project already uses Bootstrap components and utilities; the requested refactor is presentation-only and should avoid a parallel styling system.
- Alternatives considered: A larger custom CSS rewrite would allow more visual freedom but would risk regressions, inconsistency, and unnecessary scope growth.

### Responsive Navigation

- Decision: Preserve the current offcanvas approach for mobile navigation, but tighten the behavior and visuals so it feels like a first-class compact rail instead of a fallback.
- Rationale: The codebase already includes the mobile sidebar pattern, so improvement is mostly in spacing, active state clarity, and transition quality.
- Alternatives considered: Replacing the mobile pattern with a brand-new navigation model would add risk without improving the current route structure.

## Phase 1: Design & Contracts

### Data Model

- No data schema changes are expected for this UI-only refactor.
- The relevant design entities are presentation-level entities: admin shell, navigation group, CRUD surface, page header, and state panel.

### Contracts

- No external API or schema contracts are expected. The feature is internal presentation work over existing routes and actions.

### Agent Context Update

- Update the codex agent context after the plan artifacts are finalized so the repo metadata reflects the new admin UI focus.

## Constitution Re-check

No constitution violations are introduced by this plan. The implementation stays within the existing single Astro application, preserves the current route and data model, and limits itself to UI/UX changes.

## Execution Order

1. Realign the shared admin shell in `src/layouts/AdminLayout.astro` and `src/components/admin/Sidebar.astro`.
2. Normalize the admin top utility area, page header pattern, and shell spacing.
3. Update list surfaces in `src/components/admin/PostTable.astro`, `PageTable.astro`, `RoleTable.astro`, and `UserTable.astro`.
4. Update form surfaces in `src/components/admin/PostForm.astro`, `PageForm.astro`, `RoleForm.astro`, `UserForm.astro`, and related admin editors.
5. Polish shared states and responsive behavior in `src/styles/global.css` and page-level admin routes.
6. Verify the full admin journey screen-by-screen and then run repo validation.

## Verification Plan

### After Phase 1: Shell Realignment

- Open the main admin entry, posts, pages, users, roles, and header/settings screens.
- Confirm the sidebar remains full-height, the top bar reads as part of the same shell, and page headers are consistent.
- Check desktop and narrow-width navigation behavior.

### After Phase 2: CRUD Surface Unification

- Review table pages for posts, pages, users, and roles side by side.
- Review create/edit forms for posts and pages side by side.
- Confirm cards, alerts, badges, table density, and action hierarchies feel reused rather than page-specific.

### After Phase 3: Interaction Polish

- Verify hover, focus, and active states across sidebar links, page actions, buttons, tabs, and form controls.
- Confirm the mobile sidebar, dropdowns, and wrapped action bars remain usable without layout breakage.

### Final Validation

- Run `npm test`.
- Run `npm run lint`.
- Perform a final visual pass across the admin screens at desktop and mobile sizes.

## Likely Files to Change

- `src/layouts/AdminLayout.astro`
- `src/components/admin/Sidebar.astro`
- `src/styles/global.css`
- `src/pages/admin/index.astro`
- `src/pages/admin/posts.astro`
- `src/pages/admin/pages.astro`
- `src/pages/admin/roles.astro`
- `src/pages/admin/users.astro`
- `src/pages/admin/header.astro`
- `src/pages/admin/posts/new.astro`
- `src/pages/admin/posts/[id]/edit.astro`
- `src/pages/admin/pages/new.astro`
- `src/pages/admin/pages/[id]/edit.astro`
- `src/components/admin/PostTable.astro`
- `src/components/admin/PageTable.astro`
- `src/components/admin/RoleTable.astro`
- `src/components/admin/UserTable.astro`
- `src/components/admin/PostForm.astro`
- `src/components/admin/PageForm.astro`
- `src/components/admin/RoleForm.astro`
- `src/components/admin/UserForm.astro`

## Risks & Mitigations

- Risk: The shell can become more polished but still feel inconsistent if the page-level screens keep unique spacing or headers.
- Mitigation: Make the shell and page header patterns the first implementation target and reuse them everywhere else.
- Risk: Custom CSS could accumulate and drift away from Bootstrap.
- Mitigation: Keep custom rules minimal and centralized in `src/styles/global.css`.
- Risk: Mobile behavior could regress if the offcanvas or table density changes are too aggressive.
- Mitigation: Verify responsive layouts after each phase instead of leaving all responsive work for the end.
