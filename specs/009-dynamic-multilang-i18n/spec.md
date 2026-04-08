# Feature Specification: Dynamic Multi-Language System

**Feature Branch**: `009-dynamic-multilang-i18n`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Add dynamic multi-language system. Languages: not hardcoded; admin can create, enable, disable languages; one default language. Content: all translatable fields stored as JSON; unlimited languages. UI: language switch uses dynamic list; same UI across admin and client. Routing: /{lang}/{slug}. Fallback: if translation missing, fallback to default language. Goal: flexible and scalable i18n system."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin manages the language catalog (Priority: P1)

Administrators define which languages exist on the site, turn languages on or off for end users, and designate exactly one default language used when no preference applies or when a translation is missing.

**Why this priority**: Without configurable languages and a default, no other multilingual behavior can work reliably.

**Independent Test**: Can be fully tested by creating languages, toggling availability, setting the default, and verifying that only allowed states are possible (for example, one default, at least one usable language where required by policy).

**Acceptance Scenarios**:

1. **Given** an administrator with permission to manage languages, **When** they add a new language with a stable language code and display label, **Then** that language appears in the catalog and can be selected for content and switching (subject to enablement rules below).
2. **Given** multiple languages exist, **When** the administrator sets one language as default, **Then** exactly one language is marked default and any previous default is cleared.
3. **Given** a language exists, **When** the administrator disables it, **Then** it no longer appears in end-user language choices and does not receive new public traffic as a selectable locale, while existing content rules and fallback behavior follow the policies in Requirements.

---

### User Story 2 - Readers see content in a chosen language with fallback (Priority: P2)

Visitors and staff viewing public or embedded content see translatable text in their active language. If a value is missing for that language, they see the default language’s value instead.

**Why this priority**: This delivers the core user-visible value of multilingual publishing: correct language when available, graceful degradation otherwise.

**Independent Test**: Can be tested by setting partial translations and confirming that missing fields show default-language text without errors or blank critical content.

**Acceptance Scenarios**:

1. **Given** content has values for language A and B, **When** a user’s active language is B, **Then** fields show B where present.
2. **Given** a field has a value only for the default language, **When** a user’s active language is a non-default enabled language, **Then** that field displays the default language value for that field.
3. **Given** the default language is changed by an administrator, **When** fallback applies, **Then** fallback uses the currently configured default language.

---

### User Story 3 - Public URLs use language and slug (Priority: P3)

Public navigation uses a first path segment for the active language code and a slug segment for the resource, in the form `/{language code}/{slug}`, so links and bookmarks are stable per language and resource.

**Why this priority**: Clear, shareable URLs per language support SEO, support, and user expectations once the language catalog exists.

**Independent Test**: Can be tested by opening a valid `/{lang}/{slug}` link and confirming the page loads in that language (with fallback for missing pieces as in User Story 2).

**Acceptance Scenarios**:

1. **Given** an enabled language and a published slug, **When** a user opens `/{that language}/{that slug}`, **Then** they see the corresponding content with that language active where translations exist.
2. **Given** a request uses a language code that is disabled or unknown, **Then** the system responds according to the edge-case rules in Requirements (redirect, default, or error) consistently.

---

### User Story 4 - Language switch uses one consistent behavior in admin and on the site (Priority: P4)

The language switch lists all currently enabled languages from the catalog (not a fixed list in the product). The same selection control and labeling rules apply in administration and on the public site so users learn one pattern.

**Why this priority**: Reduces confusion and training cost; aligns with the goal of a flexible, scalable i18n system.

**Independent Test**: Can be tested by enabling and disabling languages in admin and observing that both admin and public switches update to match without code or config deploys for the list itself.

**Acceptance Scenarios**:

1. **Given** the administrator enables a new language, **When** an editor views admin screens and a visitor views the public site, **Then** both see the new language in the switch when policy allows it to appear there.
2. **Given** the administrator disables a language, **When** users who cannot select it open the switch, **Then** that language does not appear as a choice for new selections on the public site (and admin behavior matches policy for who may still edit legacy content).

---

### Edge Cases

- Only one language remains enabled: switching still works; default should align with that language; URLs and fallback behavior remain consistent.
- Administrator disables the language a user had previously selected: the user’s next effective language follows policy (for example, default or browser preference) without broken navigation.
- Translation missing for a non-default language but present for default: user always sees the default value for that field, not an empty string unless the default is also empty.
- Same slug in different languages: routing identifies the resource and language segment unambiguously; conflicts are prevented or resolved per catalog and slug uniqueness rules.
- Very long list of languages: language switch remains usable (scroll or grouping is acceptable as long as all enabled languages remain reachable).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authorized administrators to create languages with a stable language identifier and a human-readable label used in the language switch and lists.
- **FR-002**: The system MUST not rely on a fixed, product-shipped list of languages; the set of languages is fully driven by the catalog.
- **FR-003**: The system MUST allow administrators to enable and disable languages; disabled languages MUST NOT be offered as choices for new public language selection where this specification requires hiding them.
- **FR-004**: The system MUST maintain exactly one default language at any time among languages eligible to be default; changing the default MUST be explicit and auditable at the business level (who changed it and when).
- **FR-005**: Every translatable field MUST store values keyed by language so that any number of catalog languages can be supported without per-language columns for each field.
- **FR-006**: For any translatable field, when the value for the active language is missing or empty, the system MUST show the value for the current default language for that same field.
- **FR-007**: Public content URLs MUST follow `/{language code}/{slug}` for resources governed by this feature, using the catalog’s language identifiers for the first segment.
- **FR-008**: The language switch on the public site MUST list exactly the languages that are enabled for public selection according to policy, in a deterministic order (for example, administrator-defined order or alphabetical by label).
- **FR-009**: Administrative screens that participate in this feature MUST use the same language-switch presentation and behavior rules as the public site for listing and selecting among enabled languages, so that editors and visitors see a consistent control.
- **FR-010**: When the first URL segment is not a known enabled language code, the system MUST NOT render content as if that segment were a valid language; it MUST send the user to a controlled outcome (for example, redirect to the same resource under the default language code or a documented equivalent), consistent with Assumptions.

### Key Entities *(include if feature involves data)*

- **Language (catalog entry)**: Represents one language the product can use; has a stable code, display name, enabled flag, default flag, and optional ordering; is not duplicated with the same code.
- **Translatable field value**: A logical field (for example title, body, label) that holds one string (or rich text) per language key, with rules for fallback to the default language when a key is absent.
- **Localized public address**: A path combining an active language code and a content slug for shareable public links under this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can add a new language and make it selectable end-to-end (catalog, switch, and routing) in under ten minutes of guided use, without developer intervention to change hardcoded language lists.
- **SC-002**: In acceptance tests covering representative pages and fields, when a translation is missing for a non-default language, users see the default language text in one hundred percent of tested fields, with no blank placeholders solely due to missing locale keys.
- **SC-003**: For enabled languages, at least ninety-five percent of users in usability tests successfully change language using the switch on both admin and public surfaces on first attempt when the task is explained as “view this site in another language.”
- **SC-004**: Public URLs for the same content in two different enabled languages differ only by the language segment (and any slug differences required by localized slugs), so stakeholders can verify language-specific links independently.

## Assumptions

- At least one language remains enabled and designated as default at all times in normal operation; initial setup creates this state.
- “Unlimited languages” means there is no product-imposed hard cap smaller than what the hosting and editorial process can reasonably support; extremely large catalogs are acceptable if performance work is scheduled separately.
- Existing authentication and authorization for admin actions remain in place; this feature adds or extends permissions for managing languages where needed.
- Translatable fields for “content” include all fields the product already treats as multilingual for posts, pages, and forms; exact field lists follow current product scope unless a separate inventory is agreed in planning.
- For invalid or disabled language codes in public URLs, the preferred outcome is to redirect to the same resource path using the current default language code (or show a clear “not found” when no matching resource exists), rather than silently showing content under a wrong language.
- Behavior for administrative URLs (whether they include a language segment) may follow a separate URL pattern as long as the language switch control matches FR-008 and FR-009; public content routing follows `/{lang}/{slug}` as specified.
