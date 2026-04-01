# Feature Specification: Admin UI Refactor

**Feature Branch**: `002-admin-ui-refactor`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Refactor the admin dashboard UI and navigation for better clarity and usability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Focused Post List Management (Priority: P1)

As an admin user managing blog content, I can open the posts list and see only the posts table with row-level actions so that I can quickly scan content without form clutter competing for attention.

**Why this priority**: Post management is a core admin task, and removing competing components from the list view delivers the clearest immediate usability gain.

**Independent Test**: Can be fully tested by opening `/admin/posts` and confirming the page presents the posts table, status messaging, and row actions without any inline create or edit form.

**Acceptance Scenarios**:

1. **Given** an authenticated admin opens `/admin/posts`, **When** the page loads, **Then** the primary content area shows the posts table as the only primary management component on the page.
2. **Given** the posts list is visible, **When** the user looks for create or edit controls, **Then** they find actions that navigate to dedicated pages rather than inline forms within the list page.
3. **Given** the posts list page displays save, delete, or error feedback, **When** status messages are shown, **Then** they appear without introducing a second primary editor component into the page.

---

### User Story 2 - Dedicated Post Creation Flow (Priority: P2)

As an admin user creating a new post, I can navigate to a dedicated create page with a single clear form and a back action so that I can focus on authoring without distraction and return to the list when finished.

**Why this priority**: Creating new content is a frequent follow-up action from the posts list, and moving it into its own page establishes the intended separation of concerns.

**Independent Test**: Can be fully tested by selecting the create action from `/admin/posts`, confirming navigation to `/admin/posts/new`, completing the form, and using the back action to return to the list.

**Acceptance Scenarios**:

1. **Given** an admin with post creation access is viewing `/admin/posts`, **When** they select `Create Post`, **Then** the system navigates to `/admin/posts/new`.
2. **Given** the user is on `/admin/posts/new`, **When** the page renders, **Then** it shows a single post-creation form as the page's primary component with a visible back action to `/admin/posts`.
3. **Given** the user no longer wants to create a post, **When** they select the back action, **Then** the system returns them to the posts list without requiring browser navigation controls.

---

### User Story 3 - Dedicated Post Editing Flow (Priority: P3)

As an admin user editing an existing post, I can open a dedicated edit page for that post and return to the posts list from a back action so that I can make changes in a focused workspace tied to a single record.

**Why this priority**: Editing depends on the same separation pattern as creation, but it follows the higher-priority need to declutter the list and establish dedicated create navigation first.

**Independent Test**: Can be fully tested by selecting `Edit Post` from a row in `/admin/posts`, confirming navigation to `/admin/posts/:id/edit`, verifying the form is scoped to the selected post, and using the back action to return to the list.

**Acceptance Scenarios**:

1. **Given** an editable post appears in the list, **When** the user selects `Edit Post`, **Then** the system navigates to `/admin/posts/:id/edit` for that post.
2. **Given** the user is on a post edit page, **When** the page renders, **Then** it shows a single edit form for the selected post as the page's primary component with a back action to `/admin/posts`.
3. **Given** the user attempts to edit a post that no longer exists or is unavailable, **When** they open the dedicated edit page, **Then** the system shows a clear outcome that preserves navigation back to the posts list.

### Edge Cases

- What happens when a user deep-links directly to `/admin/posts/new` or `/admin/posts/:id/edit`? The system must show the dedicated create or edit experience without requiring the list page to be rendered first.
- What happens when a user lacks permission to create or edit posts? The system must not expose navigation actions or form submission affordances for those tasks, while still allowing permitted list access where applicable.
- How does the system handle a missing or invalid post identifier on the edit route? The system must avoid showing an empty editor for an unknown post and must provide a clear path back to `/admin/posts`.
- What happens on smaller screens where a fixed sidebar consumes horizontal space? The admin navigation must remain usable without obscuring the primary content area or forcing the page into an unreadable layout.
- How are success or error messages shown after saving or deleting a post? Feedback must remain visible and understandable while preserving the single-primary-component layout of each page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin experience MUST remove the top navigation bar from authenticated admin pages included in this feature's scope.
- **FR-002**: The admin experience MUST provide a left-aligned navigation sidebar that remains consistently available while users work within the admin area.
- **FR-003**: The admin layout MUST present one primary task component per page so that list, create, and edit workflows are visually separated.
- **FR-004**: The `/admin/posts` page MUST display the posts table as its primary component and MUST NOT include inline create or inline edit forms.
- **FR-005**: The `/admin/posts` page MUST continue to expose row-level actions relevant to each listed post, including navigation to edit and view actions when permitted.
- **FR-006**: The primary create-post action from the admin interface MUST navigate authorized users to `/admin/posts/new`.
- **FR-007**: The primary edit-post action for a post MUST navigate authorized users to `/admin/posts/:id/edit`.
- **FR-008**: The `/admin/posts/new` page MUST provide a dedicated post creation form as the page's primary component.
- **FR-009**: The `/admin/posts/:id/edit` page MUST provide a dedicated post editing form for the selected post as the page's primary component.
- **FR-010**: Both dedicated post form pages MUST provide a clearly labeled back action that returns the user to `/admin/posts`.
- **FR-011**: The admin layout MUST maintain consistent spacing, alignment, and visual hierarchy across the posts list page and the dedicated create and edit pages.
- **FR-012**: The admin layout MUST keep the main content area visually focused so that navigation, status messaging, and supporting controls do not compete with the primary task.
- **FR-013**: Status feedback related to post actions MUST be presented in a way that preserves readability and does not reintroduce multiple competing primary components on the same page.
- **FR-014**: The admin navigation model MUST preserve access to existing admin sections while adopting the sidebar-based structure for routes in scope.
- **FR-015**: The refactor MUST preserve existing permission-based visibility and access rules for post listing, creation, editing, and deletion.

### Key Entities *(include if feature involves data)*

- **Admin Navigation Surface**: The set of navigational controls used by authenticated admin users to move between admin sections and post workflows.
- **Posts List View**: The admin page focused on scanning and acting on the collection of posts, centered on the posts table.
- **Post Create View**: The dedicated admin page used to author a new post through a single primary form.
- **Post Edit View**: The dedicated admin page used to update an existing post through a single primary form tied to one post.
- **Post Action Feedback**: Success, error, or status messaging associated with list, create, edit, and delete workflows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability validation, 100% of tested admin users can identify where to navigate for post listing, post creation, and post editing within 10 seconds of entering the admin area.
- **SC-002**: In acceptance testing, `/admin/posts` displays no inline post editor or post creation form in 100% of tested states.
- **SC-003**: In acceptance testing, 100% of `Create Post` actions from the admin interface lead authorized users to `/admin/posts/new`.
- **SC-004**: In acceptance testing, 100% of `Edit Post` actions from the posts table lead authorized users to the dedicated edit page for the selected post.
- **SC-005**: In usability validation, at least 90% of tested admins complete create or edit navigation without relying on browser back controls.
- **SC-006**: In responsive validation across the project's supported admin breakpoints, the sidebar navigation and primary content remain readable and actionable in 100% of tested scenarios.

## Assumptions

- Existing admin authentication, authorization, and post-saving behavior remain in place; this feature changes workflow presentation and navigation rather than introducing new content rules.
- Existing admin sections outside the posts create and edit workflows remain available and adopt the clearer shared admin layout where relevant.
- The dedicated create and edit pages reuse the current post fields and validation expectations unless a later feature changes the editorial model.
- The existing posts deletion action remains accessible from the list view when the user has permission, because the request only separates create and edit into dedicated pages.
- A fixed left sidebar may adapt responsively on narrow screens as long as it continues to function as the primary admin navigation pattern and preserves readability.
