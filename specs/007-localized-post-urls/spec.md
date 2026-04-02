# Feature Specification: Localized Post URLs

**Feature Branch**: `[007-localized-post-urls]`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Refactor URL structure and add full multi-language support for posts.

URL:
- Remove /blog prefix
- Use clean URLs: /{lang}/{slug}

Example:
- /en/dog
- /vi/con-cho

Data model:
- Slug must be localized per language
- Description must support multiple languages

Fields:
- title (JSON)
- content (JSON)
- description (JSON)
- slug (JSON)

Routing:
- Resolve post by language-specific slug

Fallback:
- If translation missing → fallback to default language

Goal:
SEO-friendly, clean URLs with full multi-language support"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publish Localized Posts With Clean URLs (Priority: P1)

As an editor, I want to publish each post with language-specific titles, descriptions, content, and slugs so visitors can reach the same post through clean, language-specific URLs.

**Why this priority**: This is the core value of the feature. Without localized slugs and clean URLs, the site cannot deliver the requested multilingual post experience or SEO-friendly addressing.

**Independent Test**: Create a post with English and Vietnamese versions, publish it, and verify that each language is reachable through its own clean URL and shows the correct language-specific content.

**Acceptance Scenarios**:

1. **Given** an editor creates a post with English and Vietnamese titles, descriptions, content, and slugs, **When** the post is published, **Then** the post is reachable at a clean URL for each supported language and each URL shows the matching language version.
2. **Given** an editor updates the slug for one language, **When** the change is saved, **Then** the URL for that language reflects the new slug without changing the slug for other languages.

---

### User Story 2 - Browse Posts In The Selected Language (Priority: P2)

As a visitor, I want post pages to resolve by the slug for my current language so the address and content both match the language I selected.

**Why this priority**: Visitors need consistent language-specific URLs and content after editors create localized posts. This delivers the public-facing value of the feature.

**Independent Test**: Visit known localized post URLs in English and Vietnamese and confirm the system resolves the correct post and language-specific content from the URL alone.

**Acceptance Scenarios**:

1. **Given** a published post has a language-specific slug for the requested language, **When** a visitor opens that URL, **Then** the system resolves the post by that language-specific slug and displays the matching language version.
2. **Given** a visitor opens a post URL with a slug that belongs to a different language version, **When** the request is processed, **Then** the system does not incorrectly resolve a different language version under the current language path.

---

### User Story 3 - Fall Back Gracefully When Translations Are Incomplete (Priority: P3)

As a visitor, I want the site to fall back to the default language when a translation is incomplete so I can still read the post instead of seeing broken or empty content.

**Why this priority**: Translation coverage may be incomplete during rollout or ongoing editing, and fallback behavior protects continuity for visitors and editors.

**Independent Test**: Publish a post with complete English content and partial Vietnamese translations, then verify the Vietnamese URL still renders the post using default-language values only for missing fields.

**Acceptance Scenarios**:

1. **Given** a post is missing a translated title, description, content, or slug for the selected language, **When** the visitor requests that post, **Then** the system uses the default-language value for each missing field while keeping the request successful.
2. **Given** a post has no translation for any requested language-specific field except the default language, **When** the visitor requests the post, **Then** the post remains viewable using the default-language version.

---

### Edge Cases

- What happens when two posts use the same slug within the same language?
- What happens when a post has a translated title and content but no translated slug for a secondary language?
- How does the system handle a visitor requesting a language-specific post URL for a slug that no longer exists after an editor changes it?
- How does the system behave when a post has a translated slug but is missing a translated description needed for previews or metadata?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Editors MUST be able to maintain language-specific values for each post’s title, content, description, and slug.
- **FR-002**: The system MUST provide a clean public URL format for posts that uses the selected language and that language’s slug, without an extra post-category prefix in the path.
- **FR-003**: The system MUST resolve a post by the slug associated with the requested language.
- **FR-004**: The system MUST allow the default language to remain the source of truth for fallback when a secondary language value is missing.
- **FR-005**: The system MUST display the language-specific title, content, and description for a post when those values exist for the requested language.
- **FR-006**: The system MUST fall back to the default-language value for any missing translated field on a post.
- **FR-007**: The system MUST prevent two published posts from sharing the same slug within the same language.
- **FR-008**: The system MUST allow the same post to use different slugs across supported languages.
- **FR-009**: Editors MUST be able to review and edit post slugs per language from the content management workflow.
- **FR-010**: The system MUST generate post links, navigation targets, and discovery surfaces using the clean language-specific post URL format.
- **FR-011**: The system MUST preserve access to published posts for every supported language path that has a valid current slug.
- **FR-012**: The system MUST present a not-found response when a requested language-specific slug does not match any published post.

### Key Entities *(include if feature involves data)*

- **Localized Post**: A published or draft article with language-specific title, content, description, and slug values, plus shared publication metadata.
- **Localized Slug**: A language-specific addressable identifier for a post that must uniquely identify that post within one language.
- **Language Variant**: The set of values for one language within a post, including its title, description, content, and slug.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Editors can create or update a post with language-specific title, description, content, and slug values for supported languages in one content workflow.
- **SC-002**: 100% of published posts with configured language variants are reachable through the clean `/{language}/{slug}` pattern for each supported language.
- **SC-003**: 100% of requests to valid language-specific post URLs resolve to the intended post without exposing an outdated prefixed URL structure.
- **SC-004**: Visitors requesting a post with incomplete translations still receive a readable page through default-language fallback instead of an empty title, description, or body.

## Assumptions

- English remains the default language and the fallback source when translated post fields are missing.
- This feature changes post URLs only; non-post page URL behavior remains governed by existing page-localization rules unless updated in a separate feature.
- Existing editor permissions and authentication rules continue to control who can create, edit, and publish posts.
- Existing posts will be updated or normalized so they can participate in the new clean multilingual URL structure.
