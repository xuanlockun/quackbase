# Data Model: Language Management

## Language

- **Description**: Represents a locale option that can be enabled for visitors and toggled in the admin UI.
- **Fields**:
  - `code` (string, PK) — canonical locale identifier (e.g., `en`, `fr`) used for routing prefixes.
  - `name` (string) — human-friendly label shown in the dropdowns and admin table.
  - `enabled` (boolean) — whether the language appears in the dropdown and receives a `/lang` route.
  - `is_default` (boolean) — exactly one language across the dataset must have this flag to serve as the fallback.
- **Rules**:
  - Only one row may set `is_default = true`; updates must unset the previous default.
  - At least one row must have `enabled = true`; disabling checks must enforce this invariant.
  - The dropdown and routing helpers show languages where `enabled = true` sorted alphabetically or by admin-defined order.
  - All `code` values must be unique and normalized to avoid duplicate prefixes.

## Derived Context

- **Language Switch Dropdown**: Reads from the `languages` table, filters on `enabled`, and highlights the entry whose `code` matches the current route before navigation.
- **Routing Helper (switchLang)**: Detects the existing `/lang` prefix, swaps it with the selected `code`, and navigates without duplicating prefixes. It validates that the chosen `code` exists and is enabled before redirecting; otherwise, it falls back to the current default language.
