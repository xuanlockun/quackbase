# Feature Specification: Admin CRUD Layout Refactor

**Feature Branch**: `004-admin-crud-layout`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Refactor admin CRUD UX and layout for pages, users, and roles. Remove inline create/edit components from list pages. Each entity should use dedicated list, create, and edit routes. Create and Edit actions should navigate to dedicated pages, and each create/edit page should include a Back button. The admin layout should use a sidebar plus content structure with the content area filling remaining horizontal space. Use a clean, dense admin interface with basic Bootstrap components and minimal styling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Focused Entity List Management (Priority: P1)

As an admin user managing pages, users, or roles, I can open each entity list page and see only the list-focused management view so that I can scan records and choose the next action without inline forms competing for attention.

**Why this priority**: The list pages are the main entry points for admin work, and separating listing from editing is the foundation for a consistent CRUD experience.

**Independent Test**: Can be fully tested by opening `/admin/pages`, `/admin/users`, and `/admin/roles` and confirming that each page presents the list experience without inline create or edit components.

**Acceptance Scenarios**:

1. **Given** an authenticated admin opens `/admin/pages`, **When** the page loads, **Then** the primary content area shows the pages list without inline create or edit components.
2. **Given** an authenticated admin opens `/admin/users`, **When** the page loads, **Then** the primary content area shows the users list without inline create or edit components.
3. **Given** an authenticated admin opens `/admin/roles`, **When** the page loads, **Then** the primary content area shows the roles list without inline create or edit components.
4. **Given** an admin is viewing any supported list page, **When** they look for next-step actions, **Then** create and edit actions are presented as navigation to dedicated pages rather than inline workflows.

---

### User Story 2 - Dedicated Create Workflows (Priority: P2)

As an admin user creating a new page, user, or role, I can move from a list page into a dedicated create page with a visible Back action so that I can focus on one record at a time and easily return to the list.

**Why this priority**: Dedicated create pages establish the new CRUD pattern and reduce confusion caused by mixed list and form interfaces.

**Independent Test**: Can be fully tested by selecting Create from each supported list page, confirming navigation to `/new`, and verifying the page includes a dedicated creation form and a Back action to the list.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/pages`, **When** they select the create action, **Then** the system navigates to `/admin/pages/new`.
2. **Given** an admin is on `/admin/users`, **When** they select the create action, **Then** the system navigates to `/admin/users/new`.
3. **Given** an admin is on `/admin/roles`, **When** they select the create action, **Then** the system navigates to `/admin/roles/new`.
4. **Given** an admin is on any supported create page, **When** the page renders, **Then** it shows a single create-focused workflow and a visible Back action that returns to the corresponding list page.

---

### User Story 3 - Dedicated Edit Workflows In A Full-Width Admin Layout (Priority: P3)

As an admin user editing an existing page, user, or role, I can open a dedicated edit page within a sidebar-based admin layout whose content area uses the remaining horizontal space so that I can work in a clear, dense interface with predictable navigation.

**Why this priority**: Editing and shared layout consistency build on the dedicated create and list patterns, ensuring the full admin area behaves as one cohesive experience.

**Independent Test**: Can be fully tested by selecting Edit from each supported list page, confirming navigation to `/:id/edit`, verifying the edit page includes a Back action, and validating that the sidebar and content layout remain consistent across the list, create, and edit views.

**Acceptance Scenarios**:

1. **Given** an editable record appears on a supported list page, **When** the admin selects Edit, **Then** the system navigates to the matching `/:id/edit` route for that entity.
2. **Given** an admin is on `/admin/pages/:id/edit`, `/admin/users/:id/edit`, or `/admin/roles/:id/edit`, **When** the page renders, **Then** it shows a single edit-focused workflow and a visible Back action to the corresponding list page.
3. **Given** an admin navigates among supported admin pages, **When** the layout is displayed, **Then** a sidebar remains available for navigation and the content area expands to use the remaining horizontal space.
4. **Given** an admin uses the supported CRUD pages, **When** the interface is displayed, **Then** the overall presentation remains clean, dense, and visually restrained rather than spacious or decorative.

### Edge Cases

- What happens when a user deep-links directly to `/admin/pages/new`, `/admin/users/new`, `/admin/roles/new`, or a supported `/:id/edit` route? The system must show the dedicated create or edit workflow without requiring a prior visit to the list page.
- What happens when a user opens an edit route for a record that no longer exists or is inaccessible? The system must provide a clear outcome and preserve a path back to the corresponding list page.
- What happens when a user lacks permission for create or edit actions on one or more entities? The system must preserve existing access rules and avoid exposing unavailable actions while still allowing permitted navigation.
- What happens when list content is wide or forms contain many fields? The content area must continue to use the remaining horizontal space so the primary workflow remains readable and usable.
- What happens when status or error messages are shown after a create or edit action? Feedback must remain understandable without reintroducing mixed list-and-form workflows on the same page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin experience for pages, users, and roles MUST separate list, create, and edit workflows into distinct pages.
- **FR-002**: The `/admin/pages`, `/admin/users`, and `/admin/roles` routes MUST function as list pages for their respective entities.
- **FR-003**: The `/admin/pages/new`, `/admin/users/new`, and `/admin/roles/new` routes MUST function as dedicated create pages for their respective entities.
- **FR-004**: The `/admin/pages/:id/edit`, `/admin/users/:id/edit`, and `/admin/roles/:id/edit` routes MUST function as dedicated edit pages for their respective entities.
- **FR-005**: Supported list pages MUST NOT include inline create components.
- **FR-006**: Supported list pages MUST NOT include inline edit components.
- **FR-007**: Selecting the primary create action from a supported list page MUST navigate the user to that entity's dedicated create page.
- **FR-008**: Selecting the primary edit action for a record from a supported list page MUST navigate the user to that entity's dedicated edit page.
- **FR-009**: Each supported create page MUST include a clearly labeled Back action that returns the user to the corresponding list page.
- **FR-010**: Each supported edit page MUST include a clearly labeled Back action that returns the user to the corresponding list page.
- **FR-011**: Supported admin pages in scope MUST use a shared layout with a sidebar navigation area and a main content area.
- **FR-012**: The main content area MUST expand to fill the remaining horizontal space beside the sidebar.
- **FR-013**: The shared admin layout MUST remain consistent across list, create, and edit pages for pages, users, and roles.
- **FR-014**: The interface for supported admin pages MUST present a clean, dense administrative experience with restrained visual treatment and without excessive spacing.
- **FR-015**: Supported admin pages MUST use simple, familiar component patterns so that navigation controls, lists, forms, and status messaging remain immediately understandable.
- **FR-016**: The refactor MUST preserve existing permission-based access rules for listing, creating, and editing pages, users, and roles.
- **FR-017**: The refactor MUST preserve existing entity data behavior and validation expectations unless a later feature explicitly changes them.

### Key Entities *(include if feature involves data)*

- **Pages Admin View**: The administrative experience for listing, creating, and editing site pages.
- **Users Admin View**: The administrative experience for listing, creating, and editing user accounts.
- **Roles Admin View**: The administrative experience for listing, creating, and editing role definitions or assignments.
- **Admin Sidebar Navigation**: The persistent navigation surface used to move among supported admin sections.
- **Admin Content Workspace**: The primary area where the current list, create, or edit workflow is displayed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of supported pages, users, and roles list pages display without inline create or edit workflows.
- **SC-002**: In acceptance testing, 100% of supported Create actions navigate to the corresponding `/new` page for the selected entity.
- **SC-003**: In acceptance testing, 100% of supported Edit actions navigate to the corresponding `/:id/edit` page for the selected record.
- **SC-004**: In acceptance testing, 100% of supported create and edit pages include a visible Back action that returns to the corresponding list page.
- **SC-005**: In usability validation, at least 90% of tested admins can move between list, create, and edit workflows for pages, users, and roles without relying on browser navigation controls.
- **SC-006**: In layout validation across supported admin pages in scope, the sidebar remains available and the content workspace uses the remaining horizontal space in 100% of tested scenarios.
- **SC-007**: In interface review, supported admin pages are judged consistent with a dense, low-friction administrative style in 100% of approved design checks.

## Assumptions

- Existing admin authentication, authorization, and record-saving behavior remain in place; this feature refactors workflow structure and presentation rather than changing business rules.
- Existing create and edit fields for pages, users, and roles remain functionally equivalent unless follow-up features redefine those workflows.
- Existing admin navigation destinations remain available, but routes in scope adopt the shared sidebar-plus-content layout.
- The Back action returns users to the corresponding entity list page rather than attempting to reconstruct arbitrary navigation history.
- The dense visual direction favors straightforward, low-decoration administrative screens over spacious or highly branded treatments.
