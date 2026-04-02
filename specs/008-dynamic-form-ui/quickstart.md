# Quickstart: Dynamic Form UI

## 1. Prepare the project

1. Ensure the project is on branch `008-dynamic-form-ui`.
2. Confirm dependencies are installed and the workspace can run `npm test` and `npm run check`.
3. Confirm the `DB` D1 binding is available for local and deployed environments.

## 2. Apply the dynamic form migration

1. Create and apply a D1 migration for `form_fields` and `form_submissions`.
2. Confirm `form_fields` stores field type, multilingual label JSON, required state, and order.
3. Confirm `form_submissions` stores each accepted contact form response with `language`, `source_path`, and JSON field values.

## 3. Validate shared language switch behavior

1. Open a frontend page with the language switch.
2. Open an admin page with the language switch.
3. Confirm both switches use the same structure, style, and active-state behavior.
4. Confirm switching language still routes correctly in both contexts.

## 4. Validate admin dynamic form editing

1. Open the relevant admin page configuration screen.
2. Confirm the shared contact form builder loads the current field list from `GET /api/admin/form-fields`.
2. Add fields of type text, email, and textarea.
3. Provide English and Vietnamese labels for each field.
4. Reorder the fields and save.
5. Reopen the editor and confirm the order and multilingual labels persist after the page save route updates the shared form configuration.

## 5. Validate frontend banner and contact UI

1. Open a page containing the banner section and contact form section.
2. Confirm the banner uses a full-width, cleaner visual hierarchy with improved spacing.
3. Confirm the contact form uses the updated minimal Bootstrap-aligned styling and remains usable on desktop and mobile.

## 6. Validate dynamic contact form rendering and submission

1. Open the frontend page in English and confirm labels render in English.
2. Open the same page in Vietnamese and confirm labels render in Vietnamese, falling back to English when a Vietnamese label is missing.
3. Submit the form with valid values and confirm the submission is accepted by `POST /api/forms/contact`.
4. Confirm the submission is stored in `form_submissions`.
5. Submit the form with a missing required field and confirm validation feedback is returned.

## 7. Verify regression safety

1. Run `npm test`.
2. Run `npm run check`.
3. Confirm existing page-section rendering still works for non-contact sections.
4. Confirm banner and contact layout changes do not break mobile rendering.
