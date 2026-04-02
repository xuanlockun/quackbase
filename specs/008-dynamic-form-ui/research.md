# Research: Dynamic Form UI

## Decision 1: Extract one shared language switch component and reuse it in both admin and frontend

- **Decision**: Move the current language switch UI into a shared component that can render in both frontend and admin contexts with the same structure, classes, and interaction behavior.
- **Rationale**: The feature explicitly requires the client language switch to match the admin UI exactly. Reusing a single component is the most reliable way to preserve consistency and avoid future divergence.
- **Alternatives considered**:
  - Keep separate admin and frontend switch markup with duplicated styles: rejected because it would make future drift likely.
  - Build a JavaScript-only switch widget: rejected because current language switching already works through server-rendered links and does not require heavier client logic.

## Decision 2: Keep dynamic contact form configuration lightweight with a dedicated D1 table per concern

- **Decision**: Store dynamic field definitions in a `form_fields` table and submitted responses in a `form_submissions` table, with multilingual labels serialized as JSON strings in text columns.
- **Rationale**: The user requested D1-backed configuration and submission storage. Separating configuration from submissions keeps reads simple for rendering and keeps response storage append-only and easy to inspect later.
- **Alternatives considered**:
  - Embed dynamic form fields inside existing page section JSON only: rejected because submissions still need durable storage and field management becomes harder to query or validate cleanly.
  - Create a broader form-builder schema with forms, fields, validations, and response tables: rejected because the requested scope covers one flexible contact form system, not a generalized forms platform.

## Decision 3: Render the contact form dynamically from sorted field configuration with language-label fallback

- **Decision**: Load the configured field list from D1, sort by the configured order value, render each field by type, and resolve field labels using the current language with English fallback.
- **Rationale**: The feature requires admin-defined order, multilingual labels, and frontend rendering from configuration. Sorting and field-level fallback keep rendering deterministic even when translation coverage is incomplete.
- **Alternatives considered**:
  - Hardcode the existing name/email/message inputs and only localize labels: rejected because it would not deliver dynamic field management.
  - Require all languages for all fields before saving: rejected because it conflicts with the existing multilingual fallback pattern already used in the project.

## Decision 4: Improve banner and contact section presentation within the existing page section system

- **Decision**: Keep banner and contact form rendering inside the current page section pipeline but extract dedicated presentation components so those sections can be restyled cleanly without making `CmsPageSections.astro` harder to maintain.
- **Rationale**: The banner and contact form already live inside page section rendering. Extracting those pieces into focused components improves maintainability while preserving the current page composition model.
- **Alternatives considered**:
  - Keep all markup and styling changes inline in `CmsPageSections.astro`: rejected because the file is already serving multiple section types and would become harder to evolve.
  - Replace the page-section model entirely: rejected because the feature only asks for improved presentation and dynamic contact fields, not a page-builder rewrite.

## Decision 5: Accept contact form submissions through a dedicated public route and persist the submitted payload shape in D1

- **Decision**: Add a dedicated submission route for the public contact form that validates incoming values against the configured fields, stores the response in `form_submissions`, and returns a success or validation result that the frontend can surface.
- **Rationale**: The frontend needs a stable destination for dynamic form submission, and submissions must be stored in D1. A dedicated route keeps that behavior explicit and avoids mixing contact form submissions into unrelated content APIs.
- **Alternatives considered**:
  - Post to a placeholder action with no persistence: rejected because the feature explicitly requires submissions to be stored.
  - Send submissions through the page save/admin APIs: rejected because public form submission is a separate concern with different validation and permissions.
