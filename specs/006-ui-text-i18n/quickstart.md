# Quickstart: UI Translation Coverage

## 1. Prepare the project

1. Ensure the project is on branch `006-ui-text-i18n`.
2. Install dependencies with `npm install` if the workspace is not already bootstrapped.
3. Confirm the existing localized content routes still work on `/en/...` and `/vi/...`.

## 2. Add locale dictionaries

1. Create or review the top-level `locales/` directory.
2. Keep `locales/en.json` as the complete English source dictionary.
3. Keep `locales/vi.json` aligned with Vietnamese translations for in-scope UI keys.
4. Group keys by intent, such as navigation, actions, labels, and headings.
5. Keep English entries present for every in-scope key so fallback remains reliable.

## 3. Add shared UI translation helpers

1. Extend `src/lib/i18n.ts` so the app can load a locale dictionary for the resolved request language.
2. Use the shared `t(key)` helper from `src/lib/i18n.ts` so missing keys fall back to English.
3. Keep request-level language resolution in `src/middleware.ts`, preferring the URL language prefix and otherwise using the saved user preference.
4. Ensure unsupported saved preference values fall back safely to English.

## 4. Translate supported frontend screens

1. Open the shared frontend layouts and components such as the header, footer, and localized public routes.
2. Replace hardcoded navigation labels, buttons, headings, and other in-scope UI text with translation keys.
3. Visit `/en/...` routes and confirm English UI text renders.
4. Visit `/vi/...` routes and confirm Vietnamese UI text renders.
5. Temporarily remove one Vietnamese key and confirm the same screen falls back to English for that key only.

## 5. Translate supported admin screens

1. Open the admin layout, sidebar, list pages, and form components that include in-scope shared UI text.
2. Replace hardcoded navigation labels, action buttons, labels, and headings with translation keys.
3. Confirm admin screens preserve the selected interface language as you move between supported routes.
4. Confirm the dashboard remains usable when some Vietnamese keys are still missing by checking English fallback behavior.

## 6. Verify regression safety

1. Run `npm test`.
2. Run `npm run check`.
3. Confirm `tests/contract/ui-i18n-contract.spec.ts` and `tests/integration/ui-i18n-routes.spec.ts` pass alongside the existing RBAC tests.
4. Confirm the admin RBAC flow still redirects correctly and does not lose the selected language on supported screens.
5. Confirm English remains the default on routes or sessions where no language context is present.
