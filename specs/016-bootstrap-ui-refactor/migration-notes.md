# Bootstrap Migration Notes

## Remaining selectors/components that still use custom styling

1. **Admin forms with `.admin-form-stack` or `.admin-form-grid`** – most are still used by `PostForm`, `PageForm`, `RoleForm`, `UserForm`, `LanguageForm`. Each form should be updated to use Bootstrap `row`/`col`, `form-control`, `form-check`, and helper text classes as part of the next phase.
2. **Language switch component styling** – currently uses `.language-switch` helper classes and pill links; future work should align this with Bootstrap button groups or dropdowns that badge active states while preserving the language toggle behavior.
3. **Profile dropdown** – still leverages `.admin-profile-dropdown` markup; consider replacing with Bootstrap dropdown markup to reuse JS/ARIA.
4. **Banner slider in `BannerSection.astro`** – currently has custom grid/slider logic (dots, track) even after switching to Bootstrap Carousel; migrating to Bootstrap markup will allow us to remove the custom slider script.
5. **Dynamic contact form status messaging** – now uses bootstrap alerts, but additional validation states (success/error) may need more consistent text/alert classes once we hook into the script feedback states.
6. **Tables not yet refactored (e.g., translation manager tables)** – some tables still rely on `.admin-table-row` classes; these will be converted as part of later tasks.

Refer back to this list when progressing through the remaining tasks to ensure all custom selectors are covered.
