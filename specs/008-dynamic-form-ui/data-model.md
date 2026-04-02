# Data Model: Dynamic Form UI

## Supported Language

**Purpose**: Defines the languages available for field labels and shared UI rendering, beginning with English and Vietnamese.

**Fields**

- `code`: Stable language code such as `en` or `vi`.
- `label`: Human-readable language name shown in the switcher and admin UI.
- `isDefault`: Indicates the fallback language used for missing translations.
- `isEnabled`: Indicates whether the language is available for rendering and editing.

**Validation Rules**

- Exactly one enabled language is the default.
- English (`en`) is the default language in the initial rollout.
- Vietnamese (`vi`) is enabled in the initial rollout.

**Relationships**

- Referenced by multilingual field labels and the shared language switch.

## Localized Label Map

**Purpose**: Represents a multilingual field label as a JSON object keyed by language code.

**Fields**

- `en`: Default-language label.
- `vi`: Optional Vietnamese label.
- `{futureLanguageCode}`: Optional label values for future languages.

**Validation Rules**

- Persisted as valid JSON when stored in D1.
- English is required for each configurable field label.
- Empty strings do not count as completed translations.

**Relationships**

- Embedded within dynamic contact form field definitions.

## Contact Form Field

**Purpose**: Defines one configurable field in the dynamic public contact form.

**Fields**

- `id`: Unique field identifier.
- `type`: Supported field type such as text, email, or textarea.
- `label`: `Localized Label Map` stored as JSON.
- `required`: Boolean-like indicator that determines whether a value must be provided.
- `order`: Numeric position used to sort fields on render.

**Validation Rules**

- `type` must be one of the supported field types.
- `label.en` is required.
- `order` must be a positive integer.
- Multiple fields may not share the same effective display order after normalization.

**Relationships**

- Rendered by the frontend dynamic form.
- Managed by the admin field configuration UI.
- Referenced during submission validation.

## Contact Form Submission

**Purpose**: Stores one submitted response from the public contact form.

**Fields**

- `id`: Unique submission identifier.
- `submittedAt`: Timestamp when the response was received.
- `language`: Language active when the form was rendered or submitted.
- `values`: Structured set of submitted values keyed to configured fields.

**Validation Rules**

- Only configured field values are accepted.
- Required configured fields must have non-empty submitted values.
- Submitted values must match the expected input shape for the configured field type.

**Relationships**

- Validated against the active `Contact Form Field` configuration.
- Persisted independently from field configuration so historical submissions remain intact.

## Shared Language Switch UI

**Purpose**: Represents the reusable UI contract for switching languages in both admin and frontend surfaces.

**Fields**

- `availableLanguages`: Ordered list of enabled languages.
- `activeLanguage`: Currently selected language.
- `targetHrefs`: Per-language destinations for switching context.
- `variant`: Presentation mode used for placement, while preserving the same core structure and styling.

**Validation Rules**

- Admin and frontend variants must share the same interaction pattern and recognizable visual style.
- One language is always active.

**Relationships**

- Used by the frontend header and the admin navigation/sidebar.

## State Transitions

### Contact Form Configuration Lifecycle

1. Admin opens page or site configuration that includes contact form editing.
2. Admin adds or removes supported field types.
3. Admin edits multilingual labels and required state.
4. Admin reorders fields.
5. System validates the configuration and persists it.

### Frontend Dynamic Render Lifecycle

1. Visitor opens a page containing the contact form section.
2. System loads the configured field set from D1.
3. Fields are sorted by order.
4. Labels resolve in the visitor’s current language with English fallback.
5. The dynamic form renders using the sorted configuration.

### Submission Lifecycle

1. Visitor fills the rendered dynamic contact form.
2. Form submission is sent to the public submission route.
3. System validates values against the active field configuration.
4. Valid submissions are stored in `form_submissions`.
5. The visitor receives a success or validation response.
