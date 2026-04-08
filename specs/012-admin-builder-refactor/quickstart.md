# Quickstart: Admin Builder Tables

1. `npm install` (if not already run) from repo root to ensure Astro + Wrangler deps are available.
2. `npm run dev` to start the Astro dev server; access the admin builder UI in the browser via the configured route (e.g., `/admin/pages`).
3. In the builder, add sections via the “Add section” action, drag their rows to reorder, and confirm the “Active sections” table syncs with the persisted order stored in D1.
4. Repeat for the contact form table: add a field, toggle the required switch, update localized labels, drag it above another row, and verify no manual order inputs appear.
5. Open navigation management, drag rows to reorder, and confirm the helper copy is limited to concise titles when the panel is not expanded.
6. Run `npm test` and `npm run lint` to validate the backend and frontend contract checks remain green.
