# Quickstart: Running the admin translation workspace

1. **Install dependencies**  
   ```
   npm install
   ```
   Ensure Wrangler 4.x is installed globally (`npm i -g wrangler`) so Cloudflare Workers can run locally against D1.

2. **Launch the Astro + Cloudflare dev server**  
   ```
   npm run dev
   ```
   or `wrangler dev` when you need direct edge debugging. Either command boots the admin UI on `http://localhost:3000` and reuses the existing Cloudflare D1 `posts`, `languages`, and `translation_entries` tables.

3. **Access the language list**  
   Navigate to `/admin/languages` and confirm the table shows the available locales (data seeded in the D1 `languages` table). Use the new Edit action to open `/admin/languages/[locale]`.

4. **Exercise CRUD flows**  
   - Create: Use the form on the locale page to add a key/value pair; verify it appears in the table and persists after reload.  
   - Update: Click Edit on a row, change the value, save, and validate the new string reflects in D1.  
   - Delete: Remove a row and confirm the entry no longer shows when the page reloads.

5. **Verify persistence**  
   Use Wrangler or D1 tooling (e.g., `wrangler d1 execute`) to query `translation_entries` filtered by `language_id` and confirm the admin's operations match the database state.
