# Phase 1 UX/UI Audit and Issue Map

Date: 2026-05-04
Repository: `D:\Projects\edge_cms\astro-blog-starter-template`
Scope: existing client and admin UI only
Implementation status: audit only, no UI changes applied

## Audit Method

- Inspected route files, shared layouts, components, and CSS.
- Focused on real current experience as encoded in the repository.
- No screenshots were available in this pass, so findings below are based on concrete markup, styling, and interaction structure.

## File Map

### Client

- `src/components/BannerSection.astro`
- `src/components/CmsPageSections.astro`
- `src/components/CmsPageSection.astro`
- `src/components/site/SiteLayout.astro`
- `src/components/Header.astro`
- `src/layouts/BlogPost.astro`
- `src/styles/site-theme.css`
- `src/pages/index.astro`
- `src/pages/[slug].astro`
- `src/pages/[lang]/[slug].astro`

### Admin shell and shared UI

- `src/layouts/AdminLayout.astro`
- `src/components/admin/Sidebar.astro`
- `src/components/admin/FilterBar.astro`
- `src/components/admin/AdminOptionGrid.astro`
- `src/styles/global.css`

### Admin pages and forms

- `src/pages/admin/index.astro`
- `src/pages/admin/settings.astro`
- `src/pages/admin/media.astro`
- `src/pages/admin/backup.astro`
- `src/pages/admin/templates/index.astro`
- `src/pages/admin/templates/[template].astro`
- `src/pages/admin/posts.astro`
- `src/pages/admin/pages.astro`
- `src/pages/admin/banners.astro`
- `src/pages/admin/contact-forms.astro`
- `src/components/admin/PostForm.astro`
- `src/components/admin/PageForm.astro`
- `src/components/admin/BannerForm.astro`
- `src/components/admin/PostTable.astro`
- `src/components/admin/PageTable.astro`
- `src/components/admin/BannerTable.astro`
- `src/components/admin/ContactFormTable.astro`

## Executive Summary

The repository already has usable structure and a fairly complete admin feature set, but the UX quality is uneven. The default client template is too card-like and padded for a neutral starter, and the hero banner behaves like an image card with bottom-pinned copy instead of a clean flexible banner. On the admin side, the strongest issues are content density, overly technical surfaces, and weak hierarchy in pages that should feel safer and easier to scan.

The highest-value Phase 1 findings are:

1. The client banner is constrained by image behavior and shell framing, not by one obvious fixed-height rule.
2. The client default theme uses too many wrapper paddings, borders, and rounded surfaces for a neutral template.
3. Post, page, and template editing still rely on plain textareas.
4. Backup is presented as a low-level import/export utility instead of a human-friendly backup task.
5. The media page exposes too many actions with similar visual weight.
6. The admin settings page still includes the exact "Settings overview" pattern that should not be expanded further.
7. The dashboard already has accent color tokens but uses them too weakly.
8. The sidebar mark is simple but visually derivative.

## Issues Found

### Client Banner

#### Components and files controlling the banner

- `src/components/BannerSection.astro` controls banner structure, carousel markup, copy overlay, and text elements.
- `src/styles/site-theme.css` controls spacing, framing, radius, image behavior, overlay alignment, text color, and responsive behavior.
- `src/components/CmsPageSection.astro` determines where banner sections render in page composition.

#### What feels wrong

- The banner reads like a rounded content card instead of a clean hero/banner surface.
- Text is anchored to the lower-left corner, not vertically centered.
- The overall composition feels padded around the banner and inside the page shell.
- Mobile likely compresses the overlay into a small bottom strip rather than maintaining a calm hero layout.

#### Likely causes

- `.banner-slide` in `src/styles/site-theme.css` applies `border-radius: var(--site-radius-md)` and a border/background.
- `.banner-slide-overlay` uses `align-items: flex-end`, which pins text to the bottom.
- `.banner-slide-image` uses `height: auto`, `max-height: none`, and `object-fit: initial`, so the visible hero height depends on the source image instead of a controlled banner layout.
- Outer spacing comes from:
  - `.site-main` padding
  - `.page-shell` padding
  - `.page-shell__inner` padding
  - `.banner-section { margin-bottom: 1.25rem; }`
- The wide page layout in `src/layouts/BlogPost.astro` still routes content through the site shell, so the banner inherits starter-template framing.

#### Required audit answers

- Which files/components control the banner?
  - `src/components/BannerSection.astro`
  - `src/styles/site-theme.css`
  - page composition through `src/components/CmsPageSection.astro`
- Why is the banner height limited?
  - Not by a fixed height rule. It is effectively limited by the image's intrinsic size because the image is rendered at natural height and the component does not impose a stronger hero height model.
- Where are rounded corners applied?
  - `.banner-slide` in `src/styles/site-theme.css`
- Where is excess padding coming from?
  - `.site-main`, `.page-shell`, `.page-shell__inner`, and banner bottom margin in `src/styles/site-theme.css`
- Where are text color and text positioning defined?
  - `.banner-slide-copy`, `.banner-slide-caption`, and `.banner-slide-overlay` in `src/styles/site-theme.css`
- How should the banner be adjusted to meet requirements?
  - Remove corner radius and extra framing, give the banner a controlled responsive height strategy, move overlay alignment to vertical center and left/middle-left, keep both text layers white, and reduce outer shell padding around hero sections.

#### Severity

- High

### Client Mobile UI

#### What feels bad on mobile

- The client shell stacks multiple paddings, which can make the default template feel bulky.
- Banner copy likely becomes cramped because the overlay remains bottom-anchored.
- Card-heavy wrappers reduce scanability and make the starter feel more opinionated than neutral.
- The current feed and page wrappers are more boxed than necessary for a starter template.

#### Biggest layout/spacing causes

- `.site-main` mobile padding
- `.page-shell` and `.page-shell__inner` mobile padding
- blog feed section padding
- default rounded surfaces and borders across multiple sections

#### What should be fixed first

1. Banner shell spacing and copy placement
2. Page shell and section padding
3. Card framing density in blog/page surfaces

#### Severity

- High

### Neutral Default Template Styling

#### What feels too opinionated

- Repeated card borders and rounded containers
- Padded wrappers around almost every major content surface
- Decorative blog card presentation in a default starter
- Header/nav spacing that is comfortable, but slightly heavy for a neutral baseline

#### Likely causes

- `src/styles/site-theme.css` defines strong default shell tokens:
  - `--site-shell-padding-x`
  - `--site-shell-padding-y`
  - `--site-radius-*`
- Multiple surfaces opt into border + radius + surface framing by default.
- Blog feed cards and page wrappers are styled more like a finished theme than a starter baseline.

#### What should remain

- Neutral black/white/gray defaults
- Theme-configurable accent tokens from settings
- Clear typography and readable spacing

#### What should change later

- Reduce wrapper padding
- Flatten some default containers
- Keep stronger color tied to admin-configurable theme inputs rather than hard-coded starter styling

#### Severity

- High

### Admin General UX

#### What feels good already

- The admin shell is consistent and modern enough to improve incrementally.
- Common page structure exists through `AdminLayout.astro`.
- Reusable surfaces, filter bars, tables, and feedback modals already exist.

#### What feels rough

- Many screens still present system structure more than user intent.
- Tables and utility panels are consistent, but can feel dense and generic.
- Some pages have too many controls competing in the same visual tier.
- Some language in the UI is implementation-oriented rather than human task-oriented.

#### Likely causes

- The admin system was built feature-first and then visually standardized.
- There is duplicated local styling across forms/editors, which causes small behavioral and visual drift.
- Utility components like `AdminOptionGrid` are reused in places where they create a "hub/flow" feel, even when a simpler page would be better.

#### Severity

- Medium to High

### Admin Editor UX

#### Which pages use plain textarea editing

- Posts: `src/components/admin/PostForm.astro`
- Pages: `src/components/admin/PageForm.astro`
- Templates: `src/pages/admin/templates/[template].astro`
- Banner caption fields also use textarea, but that is less problematic because the content is short.

#### Why it feels poor

- Long-form content editing is visually plain and hard to scan.
- There is no stronger distinction between writing content and editing code.
- Template editing mixes high-risk raw HTML editing with a basic textarea, which looks low-confidence for a template system.

#### Appropriate editor type by use case

- Posts: markdown editor or enhanced textarea with toolbar and preview
- Pages: markdown editor or enhanced textarea with toolbar and preview
- Templates: code editor with syntax highlighting and line-oriented editing
- Banner caption: keep as simple textarea

#### Lowest-risk improvement path

- Keep storage format and API contract unchanged.
- Add editor UX on top of existing hidden inputs and submit flow.
- Start with enhanced markdown editing for posts/pages and code editing for templates.

#### Severity

- High

### Backup UX

#### What currently exists

- `src/pages/admin/backup.astro` provides SQL export and SQL import.
- It is not a backup history browser or restore manager.

#### Why it feels inconvenient

- The table selector is a raw multi-select control with OS-specific instructions.
- Export and import are framed as equivalent sibling tasks even though import is riskier.
- Import wording is technical and not strongly safety-centered.
- The UI speaks in implementation details instead of admin outcomes.

#### What is hard to scan or unsafe

- No strong separation between safe and destructive operations
- No guided distinction between full export and partial export
- No explicit restore confirmation flow beyond a warning paragraph
- No concise "what happens next" summary before import

#### Important repo-specific note

- There is no current backup list, restore history, or row-based backup picker elsewhere in the repository.
- Recommendations for backup selection/restore should improve the current import/export utility rather than assume a hidden backup inventory exists.

#### Severity

- High

### Admin Media UX

#### Why `admin/media` feels noisy

- Status summary, upload, folder creation, refresh, tree navigation, breadcrumbs, view toggles, bulk actions, folder cards, and file cards all appear with similar prominence.
- The page is feature-complete, but the attention model is weak.
- Too many controls are placed above the fold at once.

#### Which groups/actions should be reorganized

- Storage status should become lighter and more compact.
- Upload should remain the strongest primary action.
- New folder and refresh should become secondary utility actions.
- Bulk actions should appear only when selection exists, which the page already partially does; that pattern should be strengthened.
- Folder navigation and file browsing should feel more distinct from asset actions.

#### What should be more prominent

- Current location
- Upload
- Selected item count and current applicable bulk actions
- Item preview and file name

#### What should be less prominent

- Global storage status after initial understanding
- Refresh action
- Secondary metadata
- Repeated surface framing

#### Severity

- High

### Dashboard

#### Where subtle color can help

- Stat card icons
- Accent borders or soft backgrounds
- Published/active/readiness emphasis
- Setup/recommendation emphasis

#### Which elements should remain neutral

- Main page shell
- Forms
- Most tables
- Sidebar and topbar structure
- Generic admin utility cards outside the dashboard

#### Repo-specific finding

- `src/pages/admin/index.astro` already defines accent and soft-accent values per stat card.
- The page therefore does not need a new color system; it needs slightly stronger use of the one it already has.

#### Severity

- Medium

### Admin Sidebar Logo

#### Where `admin-sidebar-mark` is defined

- Markup: `src/components/admin/Sidebar.astro`
- Styling: `src/styles/global.css`

#### Why it should change

- It is simple, but the gradient dash motif feels borrowed rather than original.
- It does not communicate "CMS/admin" as clearly as it could.

#### Low-risk replacement options

- A square containing two offset horizontal bars
- A simple panel/grid mark
- A square with one inset corner notch
- A stacked rectangle mark evoking layout blocks

#### Severity

- Medium

### Settings Page

#### Important finding

- `src/pages/admin/settings.astro` currently includes a `settings-overview` block driven by `AdminOptionGrid`.
- This should be treated as something to simplify later, not a concept to expand.

#### Why it matters

- The user explicitly does not want a "Settings overview UX flow."
- The repository already contains a flow-like overview/jump pattern on the settings page.

#### Severity

- Medium

### Admin Tables, Filters, and Scanability

#### What is working

- Shared tables for posts, pages, banners, and contact forms are serviceable.
- Filters are consistent through `FilterBar.astro`.

#### What still feels developer-ish

- Action columns are icon-heavy and similar across rows.
- Content hierarchy inside rows is only moderately strong.
- Filters are generic and functional, but not especially human-friendly.
- Some screens reveal internal fields like raw image URLs more prominently than editorial information.

#### Examples

- `BannerTable.astro` gives an entire column to `imageUrl`, which is technically useful but visually noisy.
- `ContactFormTable.astro` lists useful badges, but still resolves mostly as a dense admin table instead of a task-based overview.
- `PageTable.astro` and `PostTable.astro` are solid, but still lean toward raw list management more than editorial prioritization.

#### Severity

- Medium

## Likely Causes by Area

### Client

- Starter theme tokens are too generous with padding and radius.
- Hero/banner styling treats the banner as a card with an image rather than a banner surface.
- Responsive behavior preserves structure, but not enough hierarchy.

### Admin

- Shared shell exists, but page-level UI evolved screen by screen.
- Feature completeness outpaced interaction refinement.
- Utility components are sometimes reused where simpler page framing would be calmer.
- Editor experiences have not been upgraded from basic forms yet.

## Priority Issue Map

### High Priority

- Client banner framing, copy placement, and height strategy
- Client mobile shell spacing
- Neutralizing the default client template
- Replacing plain textareas for posts/pages/templates with safer editor UX
- Reframing backup import/export into a more human and safer experience
- Simplifying hierarchy in media management

### Medium Priority

- Dashboard color polish using existing accent tokens
- Sidebar mark replacement
- Table scanability improvements
- Simplifying settings-page overview pattern
- Consolidating shared admin editor and surface styling

### Low Priority

- Minor copy tuning on utility screens
- Fine-grained badge/icon consistency cleanup

## Risks

- Banner cleanup can unintentionally affect all page sections if shell spacing changes are too global.
- Editor upgrades can add dependency and performance complexity.
- Backup UX refinement must not accidentally imply a backup-history system that does not exist.
- Media cleanup must preserve all current actions and permissions.
- Shared component cleanup should be incremental to avoid style regressions across admin screens.

## Screens and Components to Revisit in Later Phases

- `src/components/BannerSection.astro`
- `src/styles/site-theme.css`
- `src/layouts/BlogPost.astro`
- `src/pages/admin/media.astro`
- `src/pages/admin/backup.astro`
- `src/pages/admin/settings.astro`
- `src/pages/admin/index.astro`
- `src/components/admin/PostForm.astro`
- `src/components/admin/PageForm.astro`
- `src/pages/admin/templates/[template].astro`
- `src/components/admin/Sidebar.astro`
- `src/styles/global.css`

## Phase 1 Output

This document is the Phase 1 issue map and audit baseline. It intentionally does not include implementation changes, migrations, or UI rewrites.

Waiting for approval before implementation.
