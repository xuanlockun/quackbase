# Data Model: UI Translation Coverage

## Supported Language

**Purpose**: Defines the interface languages the application can serve for shared UI text.

**Fields**

- `code`: Stable language code such as `en` or `vi`.
- `label`: Human-readable language name shown in selectors and debugging output.
- `isDefault`: Indicates whether the language is the fallback language.
- `isEnabled`: Controls whether the language is available for route matching and dictionary loading.

**Validation Rules**

- Exactly one enabled language is marked as default.
- English (`en`) is the default language in the initial release.
- Vietnamese (`vi`) is enabled in the initial release.
- Additional languages must have unique codes and corresponding dictionary files before activation.

**Relationships**

- Referenced by route language resolution, saved preference validation, and locale dictionary loading.

## Locale Dictionary

**Purpose**: Stores the translated UI text entries for one supported language.

**Fields**

- `language`: The language code represented by the file.
- `entries`: A nested key-value collection for reusable interface text.

**Representative Key Groups**

- `nav.*`: Sidebar, navbar, and primary navigation labels.
- `actions.*`: Shared button text such as create, edit, delete, save, back, and view.
- `labels.*`: Common field labels and descriptive UI terms.
- `headings.*`: Page-level or section-level titles.
- `messages.*`: Short fallback or empty-state UI copy when included in scope.

**Validation Rules**

- One dictionary file exists per enabled language.
- Keys are stable and shared across screens where wording should remain consistent.
- English dictionary is the completeness baseline.
- Non-default dictionaries may be partial during rollout, but missing keys must resolve through English fallback.

**Relationships**

- Loaded by the translation helper for request-time lookup.
- Consumed by frontend pages, admin screens, shared layouts, and reusable components.

## Interface Language Context

**Purpose**: Captures the inputs used to determine which UI dictionary a given request should use.

**Fields**

- `routeLanguage`: Optional language code derived from the URL prefix.
- `savedPreference`: Optional language code derived from remembered user choice.
- `resolvedLanguage`: Final language code used for dictionary lookup.
- `fallbackLanguage`: Default fallback language code, initially `en`.

**Validation Rules**

- `routeLanguage` must be an enabled language when present.
- `savedPreference` must be ignored if it references an unsupported language.
- `resolvedLanguage` prefers `routeLanguage`, then `savedPreference`, then `fallbackLanguage`.

**Relationships**

- Drives the `t(key)` helper for each request.
- Shared by frontend and admin route handling.

## Translation Lookup Result

**Purpose**: Represents the output of resolving a UI key for the active request.

**Fields**

- `key`: Requested translation key.
- `language`: Selected interface language for the lookup.
- `value`: Resolved string returned to the UI.
- `usedFallback`: Indicates whether English fallback was needed.

**Validation Rules**

- `value` must always be a displayable string for in-scope keys.
- `usedFallback` is `true` only when the selected language lacks a value and English supplied it.

**Relationships**

- Returned by translation helpers used in components, layouts, and page-level rendering.

## State Transitions

### Interface Language Resolution

1. Request enters the Astro app.
2. System checks for a supported language prefix in the URL.
3. If no explicit route language is present, system checks for a saved preference.
4. If neither input is usable, system defaults to English.
5. The resolved language is passed into locale dictionary loading and UI translation helpers.

### UI Translation Lookup

1. A page, layout, or component requests `t(key)`.
2. System looks up the key in the resolved language dictionary.
3. If the key exists, the translated value is returned.
4. If the key is missing, system looks up the same key in the English dictionary.
5. The resolved value is rendered and fallback usage remains internal to the helper.

### Future Language Enablement

1. Product owner adds a new supported language code.
2. A matching locale dictionary file is added.
3. Route and preference validation recognize the new language.
4. Existing screens continue to work, with English remaining the fallback for any untranslated keys.
