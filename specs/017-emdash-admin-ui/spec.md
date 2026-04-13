# Feature Specification: Emdash-Inspired Admin UI Refactor

**Feature Branch**: `017-emdash-admin-ui`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Create a new specification for redesigning the Astro admin UI to closely match the visual structure, interaction patterns, and layout quality of the Emdash admin interface. Use the live admin reference and source/UI inspiration as design inputs. This is a UI/UX refactor, not a product rewrite. Keep Bootstrap as the implementation foundation unless a small amount of custom CSS is clearly required. Preserve current business logic, data flow, RBAC, and route structure."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persistent admin shell alignment (Priority: P1)
As an administrator, I want the admin shell to feel structurally close to Emdash so that navigation, context, and global actions stay predictable across every admin screen.

**Why this priority**: The shell is the most visible part of the admin experience and determines whether the rest of the UI feels cohesive or fragmented.

**Independent Test**: Open the main admin screens on desktop and confirm the sidebar, top bar, page header, and content frame remain visually consistent while still navigating to the same routes with the same permissions.

**Acceptance Scenarios**:

1. **Given** any admin screen, **When** the page loads, **Then** the admin shell presents a persistent left navigation area, a compact top utility area, and a shared content frame that remains visually consistent across screens.
2. **Given** a user with limited permissions, **When** the sidebar renders, **Then** only the allowed navigation items appear and active/current states remain obvious without changing the underlying access model.
3. **Given** a mobile or narrow viewport, **When** the admin opens navigation, **Then** the sidebar becomes an accessible overlay or equivalent compact navigation pattern without hiding the current page context.

---

### User Story 2 - Cohesive CRUD surfaces (Priority: P1)
As an editor, I want lists, cards, forms, filters, and action bars to look like one system so I can complete CRUD work without re-learning each page.

**Why this priority**: Most admin time is spent on content editing and table scanning, so this is where inconsistency causes the most friction.

**Independent Test**: Visit representative CRUD screens for posts, pages, roles, users, and settings and verify that the same card density, table treatment, header hierarchy, action placement, and field spacing recur everywhere.

**Acceptance Scenarios**:

1. **Given** a list screen, **When** records are shown or empty, **Then** the page uses the same card/tile framing, table rhythm, badge treatment, and empty-state styling as the rest of the admin interface.
2. **Given** a create or edit screen, **When** a form loads, **Then** field groups, helper text, section headers, and action buttons follow a shared layout pattern and do not introduce a unique page-specific style unless required by the content model.
3. **Given** a page with filters, inline actions, or batch actions, **When** the controls are rendered, **Then** they align in a consistent action bar pattern that is reusable across CRUD screens.

---

### User Story 3 - Responsive admin ergonomics (Priority: P2)
As an administrator using a smaller screen, I want the admin UI to remain easy to scan and operate so that the experience stays usable without desktop-only assumptions.

**Why this priority**: The current admin is primarily desktop-oriented, but the shell should degrade gracefully and preserve task flow on tablets and phones.

**Independent Test**: Resize the admin UI down to mobile widths and confirm navigation, headers, tables, and forms remain readable, tappable, and free from broken layout behavior.

**Acceptance Scenarios**:

1. **Given** a tablet or phone viewport, **When** the admin opens a list or form screen, **Then** the layout reflows into a readable single-column or compact arrangement without losing access to actions or navigation.
2. **Given** a long table or dense form, **When** the screen is narrow, **Then** the interface avoids awkward overflow, keeps the primary actions visible, and preserves focus/hover/active feedback.

### Edge Cases

- What happens when a page has no records, no permissions, or no content yet? The UI should still feel intentional rather than fallback-like.
- What happens when an error, loading delay, or empty dataset appears inside a dense admin card? The state should use the same shell spacing and tone as successful screens.
- What happens when the sidebar contains many grouped items? Grouping and active-state treatment should still keep the current section legible.
- What happens when long localized labels or long user names appear in the top bar, dropdown, or navigation? The shell should truncate or wrap gracefully without breaking alignment.

## Audit

### Current Admin Experience

- **Sidebar layout, spacing, grouping, click behavior, active states, full-height behavior**
  - Current implementation uses a dark fixed-width sidebar with section labels and icon links in [`src/components/admin/Sidebar.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/Sidebar.astro) and [`src/layouts/AdminLayout.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/layouts/AdminLayout.astro).
  - The shell already has a persistent left rail, but the spacing is heavy, the grouping is somewhat coarse, and active states are simple background variations rather than a more polished, workspace-like rail treatment.
  - Mobile uses an offcanvas version of the sidebar, but the current behavior feels like a responsive fallback instead of a first-class navigation mode.

- **Admin header/top bar**
  - The current top bar is a white header with brand chip, language switch, and user dropdown in [`src/layouts/AdminLayout.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/layouts/AdminLayout.astro).
  - It is functional, but visually separate from the sidebar and content shell, so the whole admin experience reads as assembled Bootstrap sections rather than one designed surface.

- **Content area shell and page width behavior**
  - The main content uses `container-fluid` with generous padding and a centered card wrapper in [`src/layouts/AdminLayout.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/layouts/AdminLayout.astro).
  - This produces a safe, default Bootstrap feel, but it does not yet match Emdash’s tighter page framing and denser workspace rhythm.

- **Cards, tables, badges, forms, filters, action bars**
  - Tables and cards are mostly Bootstrap defaults with custom spacing sprinkled across list and form screens such as [`src/components/admin/PostTable.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PostTable.astro), [`src/components/admin/PageTable.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PageTable.astro), [`src/components/admin/RoleTable.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/RoleTable.astro), [`src/components/admin/UserTable.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/UserTable.astro), [`src/components/admin/PostForm.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PostForm.astro), and [`src/components/admin/PageForm.astro`](/D:/Projects/edge_cms/astro-blog-starter-template/src/components/admin/PageForm.astro).
  - The current result is readable but inconsistent in density, button hierarchy, card framing, and empty-state treatment.

- **Typography hierarchy**
  - Headings, eyebrow text, muted helper copy, and action labels vary between pages and components.
  - There is a clear opportunity to standardize title, subtitle, and supporting copy hierarchy so every screen reads like part of a single product.

- **Empty/loading/error states**
  - Current empty states are mostly Bootstrap alerts or dashed boxes, and error states are also alert-driven.
  - These states work, but they do not yet share a unified visual language or shell-level framing.

- **Responsive/mobile admin behavior**
  - The current admin already collapses the sidebar into an offcanvas, but lists, forms, and action bars still rely on desktop-biased spacing.
  - Narrow-screen behavior should be improved so action placement, table scroll behavior, and page headers feel deliberate rather than compressed.

- **Visual consistency across CRUD screens**
  - CRUD screens share the same backend logic and translations, but their visual treatment is still fragmented by page-specific spacing and component-level styles.
  - Emdash suggests a more unified workspace model where every screen feels composed from the same design grammar.

### Emdash Reference Notes

- The live reference at `https://emdashcms.com/_emdash/admin/` currently redirects to a playground setup flow, so the strongest usable reference is the product structure and the open-source repository at `https://github.com/generalaction/emdash`.
- The reference product emphasizes a workspace-oriented admin shell, compact dense navigation, clearer page framing, and a more polished action hierarchy than the current Astro admin baseline.
- This feature should borrow the structural and interaction language of Emdash, not its implementation details or branding.

## Design Translation Spec

### Sidebar Information Architecture

- Preserve the current permission-aware navigation model, but present it as a more deliberate navigation rail with clear section groups, stronger hierarchy, and tighter item spacing.
- Keep navigation items grouped by purpose, such as content, management, and settings, so the current admin scope remains scannable.
- Preserve active, current-page, hover, and keyboard-focus treatment across both desktop and mobile navigation.
- Keep the sidebar full-height and visually attached to the shell rather than making it feel like a separate panel.

### Page Shell Structure

- Use a single admin shell that reads as one continuous workspace: global top bar, persistent rail, and a content canvas.
- Tighten the page width behavior so the main workspace feels more intentional and less like a generic full-width Bootstrap container.
- Let the page header act as the transition point between global navigation and page-specific work.

### Header and Top Utility Area

- Replace the current header emphasis on branding with a more utility-driven bar that keeps the brand present but secondary to context and actions.
- Keep language switching and user/session controls accessible from the top utility area.
- Make page-level actions feel like part of the shell, not isolated buttons attached to each screen.

### Card and Table Styling

- Standardize the density of cards and tables so lists, details, and empty states share the same surface language.
- Tables should feel compact, with stronger row rhythm, clearer header hierarchy, and action placement that is easy to scan.
- Cards should use a consistent header/body pattern and avoid oversized padding that makes the UI feel less like a workspace.

### Form Styling

- Forms should use a shared section pattern with predictable label hierarchy, helper text placement, and grouped actions.
- Field groups should feel denser and more structured than today, but still comfortable for longer editing sessions.
- Where multiple related fields appear together, use visually grouped sections rather than isolated inputs.

### Page Headers and Action Areas

- Every admin page should use the same header grammar: eyebrow or section label, page title, supporting description, and a right-aligned or stacked action area.
- Actions should have a clear primary/secondary hierarchy and should not depend on each page inventing its own arrangement.

### Responsive Behavior

- On smaller screens, the sidebar should convert to an overlay or equivalent compact navigation treatment with obvious close behavior.
- Page headers should stack cleanly, actions should wrap without overlap, and dense tables should remain usable without breaking the shell.
- Any custom density improvements must still preserve touch targets and keyboard access.

### Hover, Focus, and Active Interaction Patterns

- Hover states should feel subtle and directional rather than flashy.
- Active states should clearly identify the current page, the current section, and the selected control without adding visual clutter.
- Focus rings and keyboard navigation cues must remain visible and consistent across links, buttons, tabs, and form elements.

### Bootstrap and Minimal Custom CSS Notes

- Continue using Bootstrap as the base implementation layer for layout, spacing, forms, tables, buttons, badges, navs, dropdowns, and offcanvas behavior.
- Add custom CSS only where Bootstrap cannot express the intended shell character, such as refined sidebar surfaces, custom density tokens, or small spacing corrections.
- Avoid introducing a second styling system; the goal is a Bootstrap-first admin that feels intentionally designed, not a custom framework rewrite.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin experience MUST preserve all current routes, permissions, session handling, and backend behaviors while changing only the presentation layer.
- **FR-002**: The admin shell MUST present a consistent persistent navigation rail, top utility area, and content canvas across all admin screens.
- **FR-003**: The navigation rail MUST group related admin areas into clear sections and clearly indicate the active and current page without changing RBAC-driven visibility.
- **FR-004**: Every admin page MUST use a shared page-header pattern with consistent title, description, and action placement.
- **FR-005**: CRUD lists, detail panels, tables, cards, badges, alerts, and form sections MUST share a coherent visual system so the same control types look and behave consistently across screens.
- **FR-006**: Empty, loading, and error states MUST match the same shell framing and spacing language used by successful content screens.
- **FR-007**: The admin experience MUST remain usable on tablet and mobile widths, including a working compact navigation mode and legible stacked page layouts.
- **FR-008**: Hover, focus, active, and selected states MUST remain obvious for navigation items, buttons, tabs, and form controls.
- **FR-009**: The implementation SHOULD rely on Bootstrap for layout and controls, with only minimal custom CSS used for shell-specific polish and density adjustments.
- **FR-010**: The final result MUST be a noticeable visual and interaction improvement over the current Bootstrap baseline while remaining recognizable as the same Astro application.

### Key Entities *(include if feature involves data)*

- **Admin Shell**: The shared frame that contains global navigation, utility controls, and the main content canvas.
- **Navigation Group**: A related set of sidebar destinations that supports scanning, active states, and permission-driven visibility.
- **CRUD Surface**: Any list, card, form, table, or action area used for managing site content or admin resources.
- **State Panel**: A standardized presentation for empty, loading, error, or informational content inside the admin shell.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 6 representative admin screens are reviewed as visually consistent with the same shell, header, and page-header pattern.
- **SC-002**: On desktop screens, the sidebar, top utility area, and content canvas remain aligned as one coherent workspace across every audited CRUD route.
- **SC-003**: On a 375px-wide viewport, the admin remains usable without horizontal layout breakage on the primary list and edit screens.
- **SC-004**: At least 5 representative CRUD surfaces use the same spacing, card density, and action hierarchy so that page-specific styling is no longer the main visual difference between them.
- **SC-005**: Existing admin routes, permissions, and actions continue to behave as before, with no regressions in navigation or saved content workflows.
- **SC-006**: Internal reviewers can identify the result as clearly more polished than the current Bootstrap baseline without needing to inspect code.

## Risks & Assumptions

- The Emdash reference is a design target, not a pixel-perfect spec, so some structural interpretation is expected.
- Bootstrap will remain the foundation, which limits how far the shell can depart from Bootstrap’s native interaction model without custom CSS.
- The current admin logic, RBAC rules, and route structure are stable and should not change as part of this work.
- If a page requires special tooling or a dense editor view, the shell should adapt around it rather than forcing that page to look identical to every other screen.
- Any custom styling added for polish should stay small, centralized, and reusable so the UI does not drift back into page-specific one-offs.

## Implementation Plan

### Phase 1 - Shell realignment

- Refine the admin layout, navigation rail, and top utility area so the workspace structure feels Emdash-inspired before touching individual screens.
- Normalize the shared page-header pattern and content frame dimensions.

### Phase 2 - CRUD surface unification

- Align tables, cards, forms, badges, filters, and action bars across posts, pages, users, roles, and settings screens.
- Standardize empty/error/info states so all data surfaces feel like one product.

### Phase 3 - Responsive and interaction polish

- Tighten sidebar mobile behavior, focus states, action wrapping, and narrow-width readability.
- Add only the minimal custom CSS needed to match the desired density and visual polish.

### Phase 4 - Visual regression review

- Review the main CRUD routes together to confirm the final output feels cohesive, stable, and clearly improved over the baseline.

