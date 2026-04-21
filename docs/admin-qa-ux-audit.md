# Admin QA + UX Audit Plan

Use this document to review the admin area systematically before changing product code.

## 1. Audit Goals

- Verify every admin module exists, is reachable, and behaves correctly.
- Check that the UI is visually consistent across pages and screen sizes.
- Confirm that common flows are understandable, confirmed, and recoverable.
- Identify missing, partial, legacy, or duplicated features.
- Capture issues before making implementation changes.

## 2. Feature Coverage Checklist

### 2.1 Auth and Shell

- [ ] Login page loads and allows sign-in.
- [ ] Initial setup flow appears only on a fresh install.
- [ ] Logout works and clears the session.
- [ ] Admin layout renders the sidebar, top bar, page header, and content area correctly.
- [ ] Sidebar navigation only shows authorized items.
- [ ] Mobile offcanvas navigation opens and closes cleanly.
- [ ] Sidebar collapse state persists and restores.
- [ ] "View site" and language switch actions work from the top bar.

### 2.2 Dashboard

- [ ] Dashboard summary cards show the correct counts.
- [ ] Dashboard quick actions point to the intended modules.
- [ ] Dashboard loading or database failure degrades gracefully.
- [ ] Dashboard labels, icons, and arrows render correctly.

### 2.3 Posts

- [ ] Posts list loads, filters, and searches correctly.
- [ ] Create post flow works end to end.
- [ ] Edit post flow works end to end.
- [ ] Delete post flow asks for confirmation.
- [ ] View post action opens the correct public URL.
- [ ] Draft/published status is clear.
- [ ] Localized title, slug, description, and content fields save correctly.
- [ ] Slug generation and language switching behave correctly.

### 2.4 Pages and Navigation

- [ ] Pages list loads, filters, and searches correctly.
- [ ] Create page flow works end to end.
- [ ] Edit page flow works end to end.
- [ ] Delete page flow asks for confirmation.
- [ ] Page content sections can be added, reordered, edited, and removed.
- [ ] Navigation editor saves the header menu structure correctly.
- [ ] Page content, banners, blog feed, and contact form sections all render and persist correctly.
- [ ] Public page view action opens the correct localized route.

### 2.5 Media

- [ ] Media library loads assets and folders correctly.
- [ ] Upload flow works only when storage is configured and permissions allow it.
- [ ] Create folder flow works and validates folder names.
- [ ] Refresh/sync flow reports success and failure clearly.
- [ ] Grid and list views both work.
- [ ] Breadcrumbs and folder counts are accurate.
- [ ] Rename and move actions update the correct asset.
- [ ] Bulk select, bulk move, and bulk delete work correctly.
- [ ] Copy URL feedback is visible and reliable.

### 2.6 Banners

- [ ] Banner list loads and shows preview media.
- [ ] Create banner flow works.
- [ ] Edit banner flow works.
- [ ] Delete banner flow asks for confirmation.
- [ ] Active/inactive status is obvious.
- [ ] Multilingual banner copy persists correctly.

### 2.7 Contact Forms

- [ ] Contact form list loads and shows submission counts.
- [ ] Create contact form flow works.
- [ ] Edit contact form flow works.
- [ ] Delete contact form flow asks for confirmation.
- [ ] Leads view loads and supports deletion of individual submissions.
- [ ] Builder, preview, layout, appearance, and captcha options all persist correctly.
- [ ] Field ordering, required state, and multilingual labels are correct.

### 2.8 Users, Roles, Permissions

- [ ] User list loads and filters correctly.
- [ ] Create user flow works.
- [ ] Edit user flow works.
- [ ] User active/inactive state is clear.
- [ ] Role assignment UI is understandable.
- [ ] Role list loads and shows permission summaries.
- [ ] Create role flow works.
- [ ] Edit role flow works.
- [ ] Delete role flow asks for confirmation.
- [ ] Permission badges and summaries are easy to scan.

### 2.9 Languages and Translations

- [ ] Language list loads.
- [ ] Create language flow works.
- [ ] Toggle enabled state works.
- [ ] Set default language works.
- [ ] Edit language translations page loads.
- [ ] Create translation entry flow works.
- [ ] Edit translation entry flow works.
- [ ] Namespace filtering works.
- [ ] Translation tabs, locale switching, and save feedback are correct.

### 2.10 Settings, Secrets, Backup

- [ ] Site settings save correctly.
- [ ] Media storage settings save and test correctly.
- [ ] Captcha settings save correctly.
- [ ] Secret creation, verification, and deletion work.
- [ ] Backup export works with and without table selection.
- [ ] Backup import works and shows clear progress or failure feedback.
- [ ] Disabled states are obvious when configuration is missing.

### 2.11 Templates and Legacy Routes

- [ ] Template index page clearly lists all supported template fragments.
- [ ] Header, page, posts, and footer template editors load the correct content.
- [ ] Legacy routes either work intentionally or redirect clearly.
- [ ] The admin can tell which template surfaces are editable and which are legacy.

## 3. UI and UX Review Checklist

### Layout Consistency

- [ ] Page headers use the same hierarchy and spacing.
- [ ] Table pages share the same density, alignment, and action placement.
- [ ] Form pages share the same label, input, helper, and action spacing.
- [ ] Details, cards, tabs, and surfaces look like one system.

### Spacing and Alignment

- [ ] Content blocks have consistent vertical rhythm.
- [ ] Labels align with their fields.
- [ ] Table columns do not feel cramped or uneven.
- [ ] Buttons and controls line up at mobile and desktop sizes.

### Clarity of Actions

- [ ] Each page has one obvious primary action.
- [ ] Secondary actions are visually quieter.
- [ ] Destructive actions are clearly dangerous.
- [ ] Navigation actions are clearly distinct from save actions.

### Feedback Visibility

- [ ] Success states are visible after save, delete, create, or sync.
- [ ] Errors are visible where the user can understand and act on them.
- [ ] Loading states are obvious during long operations.
- [ ] Confirmations appear before destructive actions.

### Scanability and Readability

- [ ] Page titles are descriptive and specific.
- [ ] Supporting copy is short and useful.
- [ ] Tables can be scanned quickly for status, date, and action columns.
- [ ] Empty states explain what is missing and what to do next.

### Consistency Across Pages

- [ ] Icons mean the same thing everywhere.
- [ ] Button colors and tones are used consistently.
- [ ] Modal styles are consistent across feedback and confirmation flows.
- [ ] Typography and badge styles match from page to page.

## 4. Interaction Review Checklist

### Save and Update Flows

- [ ] Data remains intact after a save.
- [ ] Redirects after save land on the right page.
- [ ] Query-string feedback markers are cleared after showing a message.
- [ ] Validation failures are understandable.

### Delete Flows

- [ ] Every destructive action asks for confirmation.
- [ ] The confirmation message names the item being deleted.
- [ ] Cancel truly cancels.
- [ ] Delete success feedback is visible.

### Loading and Error States

- [ ] Database or API failures do not break the page shell.
- [ ] Error messages identify the failing action.
- [ ] Empty pages are not confused with broken pages.
- [ ] Loading spinners or pending states are used when an operation takes time.

### Empty States

- [ ] No-data states explain the next step.
- [ ] Lists with zero matches explain filtering clearly.
- [ ] Missing configuration states explain what needs to be set up.

### Edge Cases

- [ ] Large lists still render and remain usable.
- [ ] Long labels, slugs, and descriptions do not break layout.
- [ ] Invalid input is rejected with a useful message.
- [ ] Missing relationships do not crash tables or previews.
- [ ] Reordered items keep the correct order when saved.

## 5. Consistency Checks

- [ ] Icons are consistent and not random.
- [ ] Primary, secondary, and danger button styles are used predictably.
- [ ] Success, warning, and error colors are consistent with the feedback system.
- [ ] Modals are used where confirmation or status feedback matters.
- [ ] Typography weight, size, and spacing feel like one rhythm.
- [ ] Hard-coded English labels do not leak into localized admin views.
- [ ] Legacy redirects are documented or removed from the visible flow.

## 6. Known Risk Areas To Verify

- [ ] Garbled arrow or glyph rendering on dashboard and template screens.
- [ ] Hard-coded strings in otherwise localized views.
- [ ] Prompt-based media rename/move actions.
- [ ] Missing user deletion or archival flow.
- [ ] Template routes that redirect instead of editing a unique template.
- [ ] Inconsistent page titles on edit screens.
- [ ] Accessibility of tab lists, sidebars, and modal focus behavior.

## 7. Audit Output Template

For each issue found, capture:

- Page or module
- File path
- What is broken or inconsistent
- Severity
- Suggested fix
- Screenshot or reproduction note

