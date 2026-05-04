# Phase 2 Plan: Client Banner and Mobile Cleanup

Date: 2026-05-04
Repository: `D:\Projects\edge_cms\astro-blog-starter-template`
Scope: client banner and mobile layout planning only
Implementation status: planning only, no UI changes applied

## Goal

Clean up the public client banner and mobile layout so the default template feels neutral, less padded, and easier to adapt. This phase is limited to planning banner and mobile changes. It does not redesign the full client theme and does not change business logic, content format, or API contracts.

## Files and Folders Likely to Be Touched

- `src/components/BannerSection.astro`
- `src/components/CmsPageSection.astro`
- `src/layouts/BlogPost.astro`
- `src/styles/site-theme.css`
- possibly `src/components/site/SiteLayout.astro` if shell spacing needs a narrow hook for hero-first pages

## Repo-Specific Findings to Verify Before Implementation

### Banner structure and behavior

- `src/components/BannerSection.astro` renders the banner as a Bootstrap carousel with image, optional link, overlay, title, and caption.
- `src/styles/site-theme.css` controls nearly all banner presentation.
- The current banner does not use a fixed `height`, `min-height`, `max-height`, or `aspect-ratio` on the banner frame itself.
- `.banner-slide-image` uses:
  - `width: 100%`
  - `height: auto`
  - `max-height: none`
  - `object-fit: initial`
- This means the visible banner height is driven by the source image’s natural dimensions, not by a controlled hero layout.

### Why the banner currently feels constrained

- If the uploaded banner image is short, the hero becomes short.
- If the uploaded banner image has text-safe space at a different focal point, the overlay still anchors copy to the bottom edge.
- Because the image is not forced into a consistent banner frame, the user experiences the banner as "height-constrained" even though no hard cap exists.

### Where rounded corners and framing come from

- `.banner-slide` applies:
  - `border-radius: var(--site-radius-md)`
  - `border`
  - `background`
- This makes the hero read as a content card rather than a clean edge-aligned banner.

### Where extra spacing comes from

- `src/styles/site-theme.css`
  - `.site-main`
  - `.page-shell`
  - `.page-shell__inner`
  - `.site-prose--wide`
  - `.blog-feed-section`
  - `.banner-section { margin-bottom: 1.25rem; }`
- `src/layouts/BlogPost.astro`
  - wide pages still route through `site-main site-main--wide`, so the hero lives inside the starter shell rather than in a dedicated hero mode

### Where text color and positioning are defined

- `.banner-slide-copy`
- `.banner-slide-caption`
- `.banner-slide-overlay`

Current behavior:

- copy color is already white
- caption color is near-white
- overlay uses `align-items: flex-end`
- copy is effectively bottom-left

## Phase 2 Issue List

### 1. Banner reads as a rounded card, not a banner

#### Likely causes

- `.banner-slide` border radius
- `.banner-slide` border/background treatment
- shell padding around the section

#### Impact

- The default client template looks more styled and opinionated than intended.
- The banner feels inset instead of cleanly integrated.

### 2. Banner height is uncontrolled from a layout perspective

#### Likely causes

- natural image height controls the component
- no dedicated hero height model
- no responsive banner frame with cropping rules

#### Impact

- inconsistent visual weight between banners
- perceived "constrained height"
- harder to keep copy in a predictable focal area

### 3. Banner copy is anchored too low

#### Likely causes

- `.banner-slide-overlay { align-items: flex-end; }`
- overlay gradient is tuned for bottom caption behavior

#### Impact

- text feels cornered
- composition is less premium and less readable
- mobile feels cramped faster

### 4. Mobile shell spacing is cumulative rather than intentional

#### Likely causes

- page shell padding plus inner wrapper padding plus section padding
- repeated container framing in wide-content pages

#### Impact

- default template feels padded and boxed
- content loses scanability
- banner cannot feel expansive even when the image supports it

### 5. Banner and mobile behavior are not defined separately by breakpoint

#### Likely causes

- current responsive rules only reduce spacing and control sizes slightly
- the component keeps the same bottom-overlay concept across breakpoints

#### Impact

- desktop, tablet, and mobile all inherit the same composition model even though they need different copy density and spacing

## Proposed Changes

### Banner plan

#### Structural direction

- Keep the existing `BannerSection.astro` component.
- Do not change slide data shape, database schema, or API contracts.
- Keep Bootstrap carousel behavior unless a later approved phase says otherwise.

#### Visual direction

- Remove rounded corners from the banner itself.
- Remove or sharply reduce visible card framing around the hero.
- Make the hero feel flush and intentional.

#### Height strategy

Recommended approach:

- Introduce a controlled banner frame using responsive `min-height` plus optional `aspect-ratio`.
- Move the image to `width: 100%`, `height: 100%`, `object-fit: cover`.
- Let the frame define the hero size rather than the image’s intrinsic height.

Planned breakpoint behavior:

- Desktop:
  - target a strong hero presence
  - use a larger min-height or wide aspect ratio
  - allow generous but not excessive left padding for copy
- Tablet:
  - slightly reduce height
  - keep copy vertically centered
  - preserve left alignment and reduce max text width
- Mobile:
  - use a shorter but still meaningful hero
  - keep copy centered vertically within the safe area
  - reduce copy width and internal spacing
  - avoid tiny bottom-strip captions

#### Copy positioning

- Change overlay alignment from bottom-left to vertical center.
- Align copy toward the left / middle-left zone.
- Preserve both text layers as white.
- Add a max-width that keeps copy readable without pushing into the corners.
- Keep enough inset for safe readability, but reduce the current "small box in the corner" feeling.

#### Overlay treatment

- Replace the current bottom-heavy gradient with a more balanced overlay that supports centered text.
- Keep contrast high enough for white copy on variable images.
- Avoid making the banner look dark or over-designed.

### Mobile client layout plan

#### Shell spacing

- Reduce cumulative mobile padding across:
  - `site-main`
  - `page-shell`
  - `page-shell__inner`
  - section-level padding where it repeats the same spacing
- Keep content readable without making the template look boxed.

#### Banner on mobile

- Use a dedicated mobile safe area for overlay text.
- Reduce arrow/control prominence.
- Keep indicators compact.
- Ensure title and caption do not sit flush to edges.

#### Feed and content areas

- Recheck `blog-feed-section` padding and card density.
- Keep single-column reading clean and light.
- Avoid extra wrapper padding around already padded card content.

#### Overflow and touch targets

- Verify no horizontal overflow after banner changes.
- Keep buttons and controls large enough for touch, but avoid oversized button blocks where not needed.

## Proposed Desktop / Tablet / Mobile Banner Behavior

### Desktop

- Full-width banner section inside the page content flow
- No rounded corners
- Moderate controlled height
- Copy vertically centered
- Copy aligned left / middle-left
- White title and caption
- Tight outer margin below the banner

### Tablet

- Same layout model as desktop
- Slightly shorter frame
- Reduced copy width
- Slightly reduced overlay inset

### Mobile

- Shorter controlled frame
- White text remains readable
- Copy stays vertically centered, not bottom-cornered
- Smaller but not tiny headline
- Caption remains optional and should wrap cleanly
- Controls reduced in prominence

## Priority

- High

## Risk Level

- Medium

## Risks

- Switching to `object-fit: cover` may crop images differently than the current behavior.
- Reducing shell padding too broadly may affect page sections beyond the banner.
- Hero changes may alter how existing admin-uploaded banner images look if they were chosen for the current natural-height behavior.

## Rollback Strategy

- Keep banner updates isolated to:
  - `BannerSection.astro`
  - a dedicated banner CSS block in `site-theme.css`
- Keep shell spacing changes small and token-based where possible.
- If image cropping proves unacceptable, revert to the old image behavior while keeping text alignment and spacing improvements.

## How to Test and Verify

### Banner

- Test with wide, short, and tall banner images
- Test with:
  - title only
  - title + caption
  - linked and non-linked slides
- Verify:
  - no rounded corners
  - no unnecessary outer padding
  - text is not cornered
  - text remains white
  - banner height feels intentional

### Mobile

- Verify home page and localized page routes:
  - `/`
  - `/{lang}/{slug}`
- Verify:
  - no horizontal overflow
  - no stacked shell padding problem
  - banner copy remains readable
  - feed cards do not feel overly boxed
  - control sizes remain usable

### Regression checks

- page content sections still render in order
- blog feed rendering unchanged functionally
- contact form section spacing still reads well after shell cleanup

## Approval Needed Before Implementation

- Approval to change banner image behavior from natural-height rendering to a controlled hero frame with `object-fit: cover`
- Approval to reduce public shell padding for hero-first pages
- Approval to remove banner corner radius and visual card framing

## Phase 2 Output

This document is the Phase 2 client banner and mobile cleanup plan. It is implementation-ready but does not apply any code changes.

Waiting for approval before implementation.
