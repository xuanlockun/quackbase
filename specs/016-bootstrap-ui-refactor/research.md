# Research: Bootstrap UI Standardization

## Key Decisions

- **Bootstrap Delivery**: Load Bootstrap 5.3.8 via the supplied CDN `<link>` and `<script>` tags (including their integrity and crossorigin attributes) through `BaseHead.astro`. This keeps the bundle centralized, avoids duplicating npm-managed Bootstrap, and ensures both public and admin shells use the same version.
- **Markup Over Custom CSS**: Replace the sprawling `.admin-*` and `.dynamic-*` selectors with Bootstrap layout utilities (containers/rows/cols), spacing helpers, cards, tables, badges, forms, alerts, and nav components. Keep only essential brand overrides (color variables, gradient backgrounds) in `src/styles/global.css`.
- **Interactive Components**: Where custom dropdowns, off-canvas sidebars, and AJAX forms exist, keep their scripts but adapt the markup to Bootstrap’s dropdown/collapse data attributes so aria/keyboard support comes from Bootstrap while keeping translations, language switching, and contact form behavior identical.
- **Compatibility**: Ensure all refactors run inside the existing Astro + Cloudflare Workers build (TypeScript 5.9, Node 22) by avoiding Node.js-specific modules and by reusing current RBAC/session infrastructure in `AdminLayout.astro` and related components.
