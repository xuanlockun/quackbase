# Feature Specification: Language Management System

**Feature Branch**: `010-language-management`
**Created**: 2026-04-08
**Status**: Draft
**Input**: User description: "Fix and improve language management system.

Problems:
- Language switch is unstable and sometimes fails
- Languages are not managed from admin
- UI switch is inconsistent and hard to scale

Requirements:

1. Admin Language Management:
- Add /admin/languages page
- Admin can:
  - Create new language (code, name)
  - Enable/disable language
  - Set default language
- At least one language must always be enabled
- Only one default language allowed

2. Language Switch UI:
- Replace current switch with dropdown
- Show all enabled languages
- Highlight current language
- Use same component in admin and client

3. Routing Fix:
- Fix language switching logic (no duplicate prefixes)
- Support dynamic languages from database
- Ensure /{lang} routes always resolve

4. Fallback:
- If language not found -> fallback to default
- If translation missing -> fallback to default language

Goal:
Stable, scalable multi-language system with admin control and clean UI"

## User Scenarios & Testing (mandatory)

### User Story 1 - Admin controls enabled languages (Priority: P1)

As an admin responsible for translations, I need to create, enable, disable, and assign defaults for languages from a dedicated page so that the site always offers valid translations without duplication.

**Why this priority**: Admin control is the foundation for every language switch, so the system cannot ship without it.

**Independent Test**: Open /admin/languages, add a new entry while toggling enabled and default flags, then confirm the list updates and validation stops risky states.

**Acceptance Scenarios**:

1. **Given** the admin is on the languages page, **When** they add a language with a code and a display name and mark it enabled, **Then** the list updates with the new row marked enabled and with controls to toggle default and enabled state.

2. **Given** the list already has a default, **When** the admin marks a different language as default, **Then** the previous default loses its default flag and the new language is tagged as default.

3. **Given** only one language is enabled, **When** the admin tries to disable it, **Then** the action is rejected with a message that at least one language must stay enabled.

---

### User Story 2 - Consistent dropdown switch (Priority: P2)

As a site visitor or admin working in the client experience, I want a single dropdown showing all enabled languages with the current language highlighted so that switching languages feels predictable and matches the admin UI.

**Why this priority**: A clear switch keeps visitors engaged and reduces confusion when editors and guests see the same controls.

**Independent Test**: Display the shared dropdown, ensure it lists every enabled language once, verify the current language is highlighted, and confirm selection reroutes to the same page under the chosen prefix.

**Acceptance Scenarios**:

1. **Given** multiple languages are enabled, **When** a user opens the dropdown, **Then** all enabled languages appear once and the current language is visually highlighted.

2. **Given** the user selects a different enabled language, **When** the selection is confirmed, **Then** the page reroutes or reloads to the same content under the selected language prefix and the highlight moves to the new selection.

3. **Given** an admin is inside the admin console, **When** they view the language switch there, **Then** it reuses the same markup or component as the client switch and exhibits the same enabled-language list and highlighting.

---

### User Story 3 - Stable routing and fallback (Priority: P3)

As any visitor, when the requested language is missing or lacks a translation, I expect to see the default-language experience rather than an error.

**Why this priority**: Broken routes or partial translations damage trust even if the language list is managed correctly.

**Independent Test**: Request routes for known languages, for unknown language codes, and for missing translations to confirm fallback and routing behavior.

**Acceptance Scenarios**:

1. **Given** the requested /{lang}/ route matches an enabled language, **When** a visitor arrives there, **Then** the content renders with that language prefix and the corresponding translation.

2. **Given** the requested /{lang}/ route uses a language code that is not enabled or unknown, **When** a visitor arrives there, **Then** the response falls back to the default language without showing a not found error.

3. **Given** a language is enabled but a specific translation is missing, **When** the visitor requests that content, **Then** the default-language text is shown while the URL still retains the requested prefix.

---

### Edge Cases

- What happens when an admin tries to disable the only enabled language.
- How does the system react if an admin attempts to mark two languages as default.
- What happens when the dropdown receives a language code that was removed moments ago but still cached on some pages.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: Provide a /admin/languages page under the existing admin console so that authorized users can see and manage every configured language in one location.
- **FR-002**: Allow admins to create new languages by supplying a locale code and display name, and expose controls to enable or disable each language plus designate one as the default; reflect these states in the list so the admin knows what is active.
- **FR-003**: Enforce that at least one language remains enabled and that only one language can be marked as the default; reject attempts to violate either rule with a clear message.
- **FR-004**: Replace the current language switch with a dropdown that is driven by the enabled-language list, highlights the current selection, and is reused in both the admin console and the public client so that the UX remains consistent.
- **FR-005**: Derive routing prefixes from the same dynamic language list so that each enabled language automatically has an /{lang} route, duplicate prefixes are never generated, and the routing logic always resolves against the latest admin configuration.
- **FR-006**: When a request targets a language that is not enabled or a translation that is missing, fall back to the default language copy while keeping the user within a valid route instead of surfacing an error.

### Key Entities (include if feature involves data)

- **Language**: Represents a locale code, a human-friendly name, its enabled status, and whether it is the default option for fallbacks.
- **Language Switch Dropdown**: Consumes the enabled-language list, renders each option once, highlights the current selection, and is shared between client and admin views so that both contexts stay in sync.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: Admin actions that would leave zero enabled languages or multiple defaults are blocked with descriptive guidance, proving that at least one language is always enabled and only one default is allowed.
- **SC-002**: The dropdown lists all enabled languages, highlights the active language, and the same component renders inside the admin console and on the client, validated by checking the markup in each context.
- **SC-003**: Every /{lang} route resolves using the current list of enabled languages, duplicate prefixes never appear, and new languages added by admins are immediately available in routing.
- **SC-004**: Requests that reference unknown languages or hit missing translations display the default-language experience while remaining on a valid route instead of showing an error.

## Assumptions

- Only authorized administrators can access /admin/languages, so it is safe to rely on existing RBAC guards for this page.
- Language metadata remains in a central store that both the admin console and routing logic can read so the dropdown and routes see the same list.
- It is acceptable for content to fall back to default-language copy when translations are still catching up after a language is enabled.
