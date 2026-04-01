# Data Model: Admin CRUD Layout Refactor

## Admin Workspace Layout

**Purpose**: Defines the shared shell state and layout behavior used across all admin routes in scope.

**Fields**

- `currentPath`: Current admin route used for active navigation state.
- `pageTitle`: Primary page heading.
- `pageDescription`: Supporting copy for the current workflow.
- `sessionSummary`: Signed-in user identity details shown in the sidebar.
- `navItems`: Visible admin navigation destinations after RBAC filtering.
- `sidebarWidth`: Fixed sidebar width used by the layout.
- `contentMode`: Main workspace mode, always one of `list`, `create`, or `edit`.

**Validation Rules**

- `currentPath` must resolve to a supported admin route.
- `contentMode` must match the route being rendered.
- `navItems` must contain only destinations visible to the current session.

**Relationships**

- Wraps `Entity List View`, `Entity Create View`, and `Entity Edit View`.

## Admin Navigation Item

**Purpose**: Represents one sidebar link in the admin shell.

**Fields**

- `label`: Human-readable destination label.
- `href`: Route destination.
- `isActive`: Whether the current route matches the item.
- `isVisible`: Whether the current session may access the destination.

**Validation Rules**

- `href` must resolve to a valid admin route.
- Only one item should be active per render.

## Entity List View

**Purpose**: Represents the list-focused page model for one managed entity type.

**Fields**

- `entityType`: One of `pages`, `users`, or `roles`.
- `records`: Ordered collection of entity summaries.
- `statusMessage`: Optional feedback after create, edit, or delete actions.
- `loadError`: Optional blocking load failure.
- `canCreate`: Whether the current session may open the create route.
- `canEdit`: Whether the current session may open entity edit routes.
- `canDelete`: Whether the current session may use delete actions when supported.
- `createHref`: Dedicated create route for the entity.

**Validation Rules**

- The list view must not include inline create or edit state.
- `records` may be empty, but the page must still present a clear next action or empty state.

**Relationships**

- Contains many `Entity Summary` records.
- Links to one `Entity Create View` and many `Entity Edit View` routes.

## Entity Summary

**Purpose**: Represents the minimal record data needed to render a list row or card for pages, users, or roles.

**Fields**

- `id`: Stable identifier for edit routes and server mutations.
- `primaryLabel`: Main display value for the row.
- `secondaryLabel`: Supporting metadata such as slug, email, or role name.
- `statusLabel`: Current status or availability label when applicable.
- `detailBadges`: Optional compact labels such as assigned roles or permissions.
- `viewHref`: Optional public or admin detail destination.
- `editHref`: Dedicated edit route for the record.

**Validation Rules**

- `id` must map to an existing record.
- `editHref` must resolve to the corresponding entity edit page.

## Entity Form State

**Purpose**: Represents the editable field state for a reusable entity form component.

**Fields**

- `entityType`: One of `pages`, `users`, or `roles`.
- `mode`: Either `create` or `edit`.
- `recordId`: Present only in edit mode.
- `fields`: Structured entity-specific form values.
- `submitAction`: Endpoint or route action used to persist the form.
- `submitLabel`: Primary button label.
- `canSubmit`: Whether the current session may save changes.
- `backHref`: Corresponding entity list route.
- `noticeMessage`: Optional inline status or validation message.

**Validation Rules**

- `recordId` is required in edit mode and omitted in create mode.
- `fields` must contain the same set of editable values for both modes of a given entity.
- `backHref` must always resolve to the matching list page for the entity.

**Relationships**

- Used by both `Entity Create View` and `Entity Edit View`.

## Pages Form Fields

**Purpose**: Captures editable page content state for the pages create/edit workflow.

**Fields**

- `title`
- `slug`
- `description`
- `status`
- `contentMarkdown`
- `pageSections`

**Validation Rules**

- `title`, `slug`, `description`, and `contentMarkdown` are required.
- `slug` must remain normalized to the existing page slug format.

## Users Form Fields

**Purpose**: Captures editable user-management state for admin user create/edit workflows.

**Fields**

- `email`
- `displayName`
- `password`
- `isActive`
- `roleIds`

**Validation Rules**

- `email`, `displayName`, and `password` are required in create mode.
- `email` remains read-only in edit mode unless a later feature changes user identity rules.
- `roleIds` must contain valid role identifiers.

## Roles Form Fields

**Purpose**: Captures editable role-management state for role create/edit workflows.

**Fields**

- `name`
- `label`
- `description`
- `permissionIds`
- `isSystem`

**Validation Rules**

- `name` is required in create mode and remains immutable in edit mode for existing system behavior.
- `label` is required in both modes.
- `permissionIds` must reference valid permissions.

## Entity Create View

**Purpose**: Represents a dedicated `/new` page for one supported entity.

**Fields**

- `entityType`
- `form`: `Entity Form State` initialized with defaults.
- `pageActions`: Supporting links such as Back or public-view destinations.

**Validation Rules**

- The page must render one primary create form and a visible way back to the list page.

## Entity Edit View

**Purpose**: Represents a dedicated `/:id/edit` page for one supported entity.

**Fields**

- `entityType`
- `recordId`
- `form`: `Entity Form State` initialized from the selected record.
- `loadError`: Error shown when the record cannot be loaded.
- `notFound`: Indicates that the requested record is unavailable.

**Validation Rules**

- `recordId` must correspond to a valid record before editable controls are shown.
- When `notFound` is true, the page must preserve a visible path back to the corresponding list page.
