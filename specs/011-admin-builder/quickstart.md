# Quickstart: Admin builder table UX

1. **Install dependencies** (if not already done):  
   `npm install`

2. **Start the Astro dev server** with Cloudflare settings to test admin UI changes:  
   `npm run dev -- --adapter cloudflare --config astro.config.mjs`

3. **Open the admin builder** in the browser and exercise the sections, contact form, and navigation tables; verify drag-and-drop reorders and that the UI matches the compact Bootstrap table style.

4. **Persist changes** by saving and then using `npm run lint` / `npm test` to ensure TypeScript and lint rules stay clean.

5. **Repeat for backend helper changes** by running any relevant backend tests or `npm run lint` on the shared Cloudflare helpers (if separate scripts exist).
