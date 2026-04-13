# Data Model: Bootstrap UI Standardization

## Entities

1. **Admin Shell Layout**
   - **Description**: Includes `AdminLayout.astro`, sidebar, top bar, and action panels. Determines how navigation, tables, forms, and alerts are structured for admin CRUD screens.
   - **Attributes**:
     - Container hierarchy (`offcanvas`/`grid` in Bootstrap) that holds the sidebar and content.
     - Shared action slots for buttons/filters that need consistent `btn` styling.
     - Metadata (page title/description) for the top strip.
   - **Relationships**:
     - Hosts all `components/admin/*` tables/forms.
     - Consumes translation/locale helpers from `src/lib/i18n.ts`.

2. **Public Content Shell**
   - **Description**: The hero, banners, feed, and contact sections exposed to readers through `Header.astro`, `BlogPost.astro`, `CmsPageSections.astro`, `BannerSection.astro`, and `DynamicForm.astro`.
   - **Attributes**:
     - `container` scope for responsive spacing.
     - Bootstrap `navbar`, `card`, and `carousel` structures for hero/feed.
     - Contact form inputs that map to Bootstrap form-control classes.
   - **Relationships**:
     - Uses `DynamicForm` for contact submissions (AJAX).
     - Honors `getSiteConfig`/`getPublishedPageBySlug` data sources from `src/lib/blog.ts`.

3. **Bootstrap Asset Layer**
   - **Description**: The CDN-provided CSS/JS plus any minimal overrides in `src/styles/global.css`.
   - **Attributes**:
     - Ensures all pages share the same spacing, buttons, badges, alerts, tables, and nav components.
     - Overrides allow brand colors/variables without redefining Bootstrap layout logic.
   - **Relationships**:
     - Injected via `BaseHead.astro` into both admin and public pages.
     - Provides foundation for the responsive classes used across admin/public components.
