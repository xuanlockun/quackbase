# Data Model: Admin UI Refactor

## Admin Layout State

**Purpose**: Defines the shared shell state used across admin pages in scope.

**Fields**

- `currentPath`: Active admin route used to highlight the sidebar navigation.
- `pageTitle`: Primary heading shown in the content area.
- `pageDescription`: Supporting description for the active admin task.
- `sessionSummary`: Signed-in user identity details shown in the sidebar.
- `navItems`: Visible admin navigation links after RBAC filtering.

**Validation Rules**

- `currentPath` must match a valid admin route.
- `navItems` must include only destinations the current session may access.

**Relationships**

- Supplies navigation and page framing to `Posts List View`, `Post Create View`, and `Post Edit View`.

## Sidebar Navigation Item

**Purpose**: Represents one visible destination in the left sidebar.

**Fields**

- `label`: Human-readable destination name.
- `href`: Route to navigate to.
- `isActive`: Whether the item matches the current page.
- `isVisible`: Whether the current session may see the item.

**Validation Rules**

- `href` must resolve to a valid admin destination.
- Only one item should be active for a given page render.

## Posts List View

**Purpose**: Represents the read-focused page model for `/admin/posts`.

**Fields**

- `posts`: Ordered collection of `Post Summary` records.
- `statusMessage`: Optional feedback message after create, update, or delete.
- `loadError`: Optional blocking error message when the list cannot be loaded.
- `canCreate`: Whether the current session may access the create route.
- `canEdit`: Whether the current session may access edit routes.
- `canDelete`: Whether the current session may trigger delete actions.

**Validation Rules**

- The view must not include embedded editor state.
- `posts` may be empty, but the page must still render a clear list state.

**Relationships**

- Contains many `Post Summary` records.
- Links to `Post Create View` and `Post Edit View`.

## Post Summary

**Purpose**: Represents the information needed to render one row in the posts table.

**Fields**

- `id`: Stable post identifier used for route generation and API fetches.
- `title`: Display title.
- `description`: Short excerpt or summary.
- `slug`: Public post slug.
- `status`: Editorial status.
- `updatedAt`: Last modified timestamp for sorting and display.
- `viewHref`: Public preview or published route.
- `editHref`: Dedicated admin edit route when permitted.

**Validation Rules**

- `id` must correspond to an existing post record.
- `status` must map to a supported editorial state.

## Post Form State

**Purpose**: Represents the editable state shared by create and edit pages.

**Fields**

- `mode`: Either `create` or `edit`.
- `id`: Present only in edit mode.
- `title`: Required post title.
- `slug`: Required normalized slug.
- `description`: Required short summary.
- `heroImage`: Optional hero image URL.
- `status`: Required editorial state.
- `pubDate`: Optional publish timestamp.
- `contentMarkdown`: Required markdown body.
- `submitLabel`: Primary action label based on mode.
- `submitEnabled`: Whether the current session may save.

**Validation Rules**

- All required content fields must be populated before submission.
- `id` is required in edit mode and absent in create mode.
- The form must reuse the same field set in both modes unless a later feature changes the editorial schema.

**Relationships**

- Backed by the existing `posts` data record in edit mode.
- Submitted through the admin post API contract.

## Post Create View

**Purpose**: Represents the dedicated `/admin/posts/new` page.

**Fields**

- `form`: `Post Form State` initialized with default values.
- `backHref`: Posts list route fallback.
- `statusMessage`: Optional save error or contextual guidance.

**Validation Rules**

- The page must render exactly one primary post form component.

## Post Edit View

**Purpose**: Represents the dedicated `/admin/posts/:id/edit` page.

**Fields**

- `postId`: Route parameter for the selected post.
- `form`: `Post Form State` initialized from fetched post data.
- `backHref`: Posts list route fallback.
- `loadError`: Message shown when the post cannot be loaded.
- `notFound`: Indicates the requested post does not exist or cannot be edited.

**Validation Rules**

- `postId` must map to a valid post before edit controls are shown.
- When the post is missing, the page must provide navigation back to the list and must not show an empty save form.

## Back Navigation Action

**Purpose**: Encapsulates the behavior of the shared back control on create/edit pages.

**Fields**

- `preferredBehavior`: Browser history navigation when a meaningful prior entry exists.
- `fallbackHref`: `/admin/posts`.
- `label`: User-facing back text.

**Validation Rules**

- The control must always lead back to the posts list even when history navigation is unavailable or unsuitable.
