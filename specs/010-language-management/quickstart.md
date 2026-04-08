# Quickstart: Language Management System

1. `npm install` (if dependencies changed) and `npm run lint` to confirm the workspace is clean.
2. `npm run dev` (Astro dev server with Cloudflare Workers target) while logged in as an admin to exercise `/admin/languages`.
3. Seed the `languages` table via existing D1 seeding helpers (e.g., `src/lib/blog.ts` utils or new migration) so dropdown and routing helpers have data to work with.
4. Open `/admin/languages`, confirm the table and form behave (can create languages, toggle enable/default, and the notice area surfaces success/errors) without reloading the page.
5. Verify the shared dropdown renders in both the public client and admin sidebar, highlights the current language, and reroutes via `/switchLang` without duplicate prefixes.
6. Test edge cases: disabling the only enabled language is blocked, marking a different language as default propagates through the dropdown, requesting unknown `/lang/` routes redirects to the default, and missing translations fall back to the default-language copy.
6. Once behavior matches the spec, add unit/integration tests around the new language APIs, dropdown component, and routing helpers before moving to `/speckit.tasks`.
