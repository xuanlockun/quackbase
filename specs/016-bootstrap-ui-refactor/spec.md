# Feature Specification: Bootstrap UI Standardization

**Feature Branch**: `016-bootstrap-ui-refactor`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Refactor the current UI to use Bootstrap consistently across the application, audit every layout/component, swap custom styling for Bootstrap 5.3.8 via CDN, and preserve the existing business logic and data flows while cleaning up navigation, forms, tables, cards, alerts, badges, and admin pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin shell with consistent Bootstrap layout (Priority: P1)
As an administrator I need every admin surface (posts, pages, users, roles, translations, permissions) to feel like a single system so I can move between tables, filters, and forms without mentally translating matching spacing and controls.

**Why this priority**: The admin console is the most interactive collection of screens and includes all CRUD workflows whose usability suffers when controls, tables, and cards do not share the same layout or sizing heuristics.

**Independent Test**: Load the posts list, open a post form, visit the language table, and confirm each view uses Bootstrap `container-*` grid, nav, button, and table classes while still showing the expected fields and actions.

**Acceptance Scenarios**:

1. **Given** the current admin top bar, sidebar, and table layouts, **When** an admin navigates between posts, pages, users, and roles, **Then** the layout is driven by Bootstrap containers/rows/cols, the navigation uses Bootstrap nav/pills or dropdown markup, and every action button renders with the same `btn` style (e.g., `btn-primary`, `btn-outline-secondary`).
2. **Given** the post/page/role forms, **When** the admin views a form, **Then** inputs, selects, textareas, checkboxes, and grouped actions all use Bootstrap form classes (`form-control`, `form-check`, `input-group`, etc.) and the status badges/alerts share Bootstrap `badge` or `alert` tones.

---

### User Story 2 - Public site with Bootstrap containers (Priority: P2)
As a visitor I want the home/blog/contact surfaces to have a cohesive grid, spacing, cards, and typography so that hero, feed, slider, and form sections look polished and readable on every breakpoint.

**Why this priority**: The public brand is the first impression for readers; inconsistent cards, nav links, and forms leave the UI feeling unfinished even if the data is correct.

**Independent Test**: Visit the home page, select a blog post, and verify that the header/nav, hero image/cards, blog feed, banner slider, and contact form all rely on Bootstrap utilities and that dynamic sections still load the right data (e.g., blog feed links, contact form submission hooks).

**Acceptance Scenarios**:

1. **Given** the existing Header, BlogPost layout, and CmsPageSections components, **When** a language/default visitor loads the page, **Then** the markup wraps content in Bootstrap `container`/`row`/`col`, the navigation uses Bootstrap `.navbar`, cards/sliders use `.card` or carousel structure, and typography/spacing align with Bootstrap spacing utilities.
2. **Given** the contact form and dynamic banner carousel, **When** data is rendered, **Then** the form fields use Bootstrap form classes, the submit button uses `btn`, the status messaging uses Bootstrap `alert` colors, and the slider/panels respond to Bootstrap breakpoints at the same data volume.

---

### User Story 3 - Language switch and dynamic interactions (Priority: P3)
As a translator or editor I need the language switcher, profile dropdown, and contact form behaviors to keep working once they adopt Bootstrap components so there are no surprises when interacting with dropdowns, toggles, or AJAX forms.

**Why this priority**: These widgets power personalization/localization flows and could regress if markup changes break event listeners or accessibility cues.

**Independent Test**: Use the language switcher, toggle the admin sidebar (if implemented with Bootstrap collapse/offcanvas), open the profile dropdown, and submit the contact form to ensure behaviors function exactly as today while the new markup uses Bootstrap dropdown classes and consistent spacing.

**Acceptance Scenarios**:

1. **Given** the language switch and admin profile dropdown, **When** a user interacts with them, **Then** they continue to toggle correctly using Bootstrap dropdown/collapse interactions (touch-friendly, keyboard support) without losing translations or login/session behavior.

---

### Edge Cases

- What happens when a blog page has no banner URLs or posts (should render Bootstrap placeholders/cards without layout collapse)?
- How does the system handle empty contact form configs or disabled fields (Bootstrap forms should show helper text/disabled state while preserving client-side validation ropes)?

## UI Audit & Inventory

_Step 1: Document every surface that currently relies on bespoke styling so we know what to refactor._

- **Global styling (`src/styles/global.css`)**: defines body background gradient, typography, `.prose`, `.admin-*` utilities, `.dynamic-contact-*` controls, custom tables, cards, grids, forms, badges, and responsive sidebars. All of those selectors will be replaced with Bootstrap containers, spacing utilities, tables, forms, badges, and grid classes plus a small `:root` palette.
- **Public header & layout**: `src/components/Header.astro`, `HeaderLink.astro`, `BlogPost.astro`, `CmsPageSections.astro`, `BannerSection.astro`, and `DynamicForm.astro` rely on CSS-in-file layout rules, manual nav link decoration, custom grid/card structures, and bespoke slider/form styling. We will convert them to Bootstrap `navbar`, `card`, `container`, `row`, `col`, `carousel`, and form classes while keeping any inline scripts (banner slider, contact AJAX).
- **Language switch & footer**: `LanguageSwitch.astro` currently renders pill buttons; browsers rely on `.language-switch` styles. We'll swap these for Bootstrap button groups or dropdowns, ensuring the interaction remains identical.
- **Admin layout & navigation**: `src/layouts/AdminLayout.astro`, `components/admin/Sidebar.astro`, and the `.admin-shell`/`.admin-topbar` classes handle the column layout, sidebar toggle, dropdown, and topbar. We'll remodel this with Bootstrap grid + `offcanvas`/`navbar` for the sidebar, a Bootstrap dropdown for the profile menu, and consistent `btn` utilities.
- **Admin forms & tables**: `components/admin/PostForm.astro`, `PageForm.astro`, `RoleForm.astro`, `UserForm.astro`, `LanguageForm.astro`, `PermissionBadge.astro`, `RoleEditor.astro`, `PostTable.astro`, `PageTable.astro`, `UserTable.astro`, `LanguageTable.astro`, and others use `.admin-form-stack`, `.admin-table`, `.admin-status-pill`, `.admin-role-chip`, `.admin-table-row`, `.admin-row-actions`. Each will be mapped to Bootstrap form controls, validation helpers, tables with `table-striped`/`table-hover`, badges, and responsive grid helpers.
- **Dynamic behavior scripts**: Banner slider, contact form submission logic, and translation manager scripts currently rely on existing markup; after switching to Bootstrap we must reattach selectors or data attributes to keep them working (e.g., contact form still listens for `[data-dynamic-contact-form]` but fields render with `form-control`).

## Requirements *(mandatory)*

The refactor must satisfy Step 2: refactor every major UI surface to Bootstrap, keeping behavior intact while enforcing consistent layout, spacing, typography, navigation, forms, tables, cards, alerts, badges, modals/popovers, and Bootstrap-supported interactions on both public and admin screens.

### Functional Requirements

- **FR-001**: Bootstrap 5.3.8 must be loaded via the provided CDN `<link>` and `<script>` tags (including the given integrity/crossorigin attributes) from the shared head component so all pages (public and admin) share the same styles and interactive bundle before any other custom styles run.
- **FR-002**: Remove the sprawling custom layout CSS in `src/styles/global.css` and replace it with a minimal override file that keeps only brand colors/variables (e.g., accent) and utility tweaks that cannot be achieved with Bootstrap (e.g., accent gradient backgrounds). All layout, navigation, form, table, card, badge, and spacing rules must defer to Bootstrap classes.
- **FR-003**: Public surfaces (`Header`, `BlogPost`, `CmsPageSections`, `BannerSection`, `DynamicForm`, `LanguageSwitch`) must be restructured to use Bootstrap `container`/`row`/`col`, `navbar`, `nav-link`, `card`, `carousel`, `form` controls, and spacing utilities, ensuring hero, feed, slider, and contact sections consistently use the same grid and spacing across breakpoints while retaining the existing translations and AJAX form behavior.
- **FR-004**: Admin surfaces (`AdminLayout`, `Sidebar`, `Topbar`, `profile dropdown`, `PostForm`, `PageForm`, `LanguageForm`, `UserForm`, `RoleForm`, `PostTable`, `PageTable`, `UserTable`, `LanguageTable`, `PermissionBadge`, `RoleEditor`, etc.) must adopt Bootstrap containers/rows, `offcanvas` or responsive grid for the sidebar, `nav`, `btn`, `table`, `badge`, and `form` helpers so table data, form fields, and inline actions share the same sizing, spacing, and colors while keeping RBAC/CRUD functionality untouched.
- **FR-005**: Interactive interactions (toggleable sidebar, dropdowns, language switch, contact form submission, translation scripts) must be wired to Bootstrap-friendly markup (dropdown classes, collapse triggers, alerts) so their behavior (ARIA states, keyboard support, AJAX submissions) remains intact and accessible, even if underlying elements use new Bootstrap selectors instead of old `.admin-*` classes.

### Key Entities *(include if feature involves data)*

- **Admin Shell Layout**: the combination of `AdminLayout`, `Sidebar`, topbar, form sections, and tables -- this entity spans every admin screen and determines how navigation, actions, and data grids share spacing/controls.
- **Public Content Shell**: header, hero, blog post layout, dynamic sections (`CmsPageSections`), banner carousel, and contact form -- these compose the public experience and must reuse the same Bootstrap grid/card/spacing rules.
- **Bootstrap Asset Layer**: the CDN-loaded CSS and JS bundle plus any minimal overrides in `src/styles/global.css`; this entity ensures both shells stay aligned to the same design system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All audited public and admin screens (home, blog post, contact form, admin post list, admin post form) render with Bootstrap grid and spacing (container/row/col/spacing classes) and no longer depend on bespoke `.admin-*` layout selectors -- verified by inspecting at least five templates for the appropriate class usage.
- **SC-002**: Forms and tables across both shells use Bootstrap form controls (`form-control`, `form-check`, `form-select`) and table classes (`table`, `table-striped`, etc.), while status badges/alerts reuse Bootstrap `badge`/`alert` tones; success is confirmed when every form/table template references Bootstrap families instead of the older custom classes.
- **SC-003**: Interactive widgets (language switcher, sidebar toggle, profile dropdown, contact form AJAX) continue to work and remain accessible after the markup change; confirm by running existing flows and noting no regression in keyboard navigation or fetch results.
- **SC-004**: The provided Bootstrap CDN assets load with their integrity hashes, and no page relies on locally bundled bootstrap packages, ensuring the same version is used everywhere as documented in the requirement.

## Assumptions

- Bootstrap 5.3.8 CDN assets are reachable from all target environments and can safely replace the current locally imported `bootstrap/dist/css/bootstrap.min.css`.
- The accent, typography, and gradient palette defined today can be preserved via CSS variables layered on top of Bootstrap rather than re-implementing entire sections.
- Business logic (content fetching, RBAC, form submissions, translations) is unchanged; the effort is strictly presentation and markup cleanup.
- Admin and public components can leverage the shared `BaseHead` to inject CDN assets so both shells reuse the same bundle without duplication.
