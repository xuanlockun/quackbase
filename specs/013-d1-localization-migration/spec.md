# Feature Specification: Dynamic Localization Data Migration

**Feature Branch**: `013-d1-localization-migration`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Move localization data from static JSON files into Cloudflare D1 so translations can be loaded dynamically at runtime while keeping only user-facing strings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Localized admin UI renders from the dynamic store (Priority: P1)

Admins and editors need every navigation label, button text, status indicator, and help message to reflect the chosen language so they can manage content with confidence.

**Why this priority**: If the admin grid or navigation keeps default English labels, the bilingual experience breaks and the team cannot verify non-English content.

**Independent Test**: Switch the admin UI between English and Vietnamese and confirm that navigation, button labels, and help text match the values returned by the dynamic localization service rather than falling back to stale bundle text.

**Acceptance Scenarios**:

1. **Given** the localization store contains translations for `nav.home`, `actions.createPost`, and `labels.roles` in English and Vietnamese, **When** the active locale changes, **Then** the UI renders those strings immediately with no placeholder keys.
2. **Given** a key such as `messages.managePermissions` is missing for Vietnamese, **When** the UI requests the Vietnamese payload, **Then** the default-language string appears and a fallback incident is recorded for monitoring.

---

### User Story 2 - Translation edits appear without redeploy (Priority: P2)

Translation managers must be able to adjust copy (e.g., marketing callouts, alerts, or button text) and see the changes appear in the admin UI without rebuilding static JSON files or redeploying the site.

**Why this priority**: Editors frequently iterate on microcopy, so having to edit JSON, rebuild, and redeploy creates an unnecessary bottleneck.

**Independent Test**: Update one translation entry in the dynamic store, open the admin page that uses that key, and verify the new text renders after the cache invalidation window expires.

**Acceptance Scenarios**:

1. **Given** a translation update is written into the localization store for the active locale, **When** the admin refreshes the page after the cache TTL, **Then** the refreshed value is rendered without a new deployment.

---

### User Story 3 - Migration and payload cleanup removes verbose metadata (Priority: P3)

The engineering team needs to migrate existing JSON content into D1 and strip descriptive metadata so that the runtime payload contains only user-facing strings.

**Why this priority**: Removing descriptive fields such as `messages.permissionCatalogDescription` shrinks payload size and removes noise from translation requests.

**Independent Test**: Run the migration tool, compare the number of rows inserted per locale to the unique set of keys in `locales/*.json`, and confirm that description-only entries are excluded from the result.

**Acceptance Scenarios**:

1. After running the migration, every supported key from the JSON files (excluding descriptive metadata entries) exists as a row for each locale in the D1 table, and no runtime payload includes the removed descriptive strings.

---

### Edge Cases

- When D1 contains no entries for an active locale, the UI should fall back to the default locale’s strings, show the fallback copy, and emit a fallback metric so the gap can be resolved.
- When the localization endpoint cannot reach D1 (timeout, rate limit, or authentication failure), the UI should continue using cached translations or default language strings and surface a non-blocking error message so users can continue working.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST persist translation entries in Cloudflare D1 with at least `locale_code`, `translation_key`, and `translated_value` so every UI label can be resolved at runtime.
- **FR-002**: The runtime localization API MUST load translations from D1 each time a locale is requested and return only the keys needed by the currently rendered view, deliberately excluding descriptive entries such as `permissionCatalogDescription` unless a specific workflow requires them.
- **FR-003**: The migration pipeline MUST read the existing `locales/*.json` files, convert each string into a D1 row tagged by locale and key, and drop verbose metadata fields before insertion.
- **FR-004**: Translation updates MUST be possible by writing to the D1 table so editors or automated scripts can refresh copy without editing static JSON files or redeploying.
- **FR-005**: The localization payload MUST be compact—limited to the keys that matter for a page’s controls, labels, and messages—to keep per-request sizes small and to reduce worker execution time.
- **FR-006**: When a translation key is missing for the requested locale, the service MUST fallback to the default locale and record the missing key so it can be added to the dataset.

### Key Entities *(include if feature involves data)*

- **TranslationEntry**: A D1 row representing a single translation key, including `locale_code`, `translation_key` (dot-separated namespace), `translated_value`, and `updated_at`.
- **LocaleConfiguration**: The metadata describing each supported language, such as `code`, `display_name`, `enabled`, and whether it is the default.
- **LocalizationPayload**: The aggregated set of translation entries returned to the UI for a locale, optionally scoped to specific namespaces or UI sections.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When an editor toggles between supported locales, every navigation label, button text, and admin help message for that locale renders within two seconds using the dynamic store with no placeholder keys.
- **SC-002**: Average translation payload size per locale request shrinks by at least 30% compared to the static JSON baseline because descriptive entries are removed and only the requested keys are returned.
- **SC-003**: Translation updates applied to the dynamic store become visible in the UI within 30 seconds without any redeploy.
- **SC-004**: After migration, there are zero missing translation warnings for the supported locales, and descriptive metadata fields no longer appear in runtime payloads.

## Assumptions

- Cloudflare D1 is available to the Worker runtime and can store and serve the translation rows needed by the UI.
- The existing `locales/*.json` files already contain every translation key that the admin UI currently depends on.
- Verbose description fields such as `messages.permissionCatalogDescription` are only used for documentation and can be removed from runtime payloads without losing any user-visible text.
- Existing RBAC controls can be applied to the localization update workflow so only authorized editors update translation rows.
