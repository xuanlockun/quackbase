# Research: Emdash-Inspired Admin UI Refactor

## 1) Admin shell first, screen polish second

- Decision: Refactor the shared admin layout and sidebar before harmonizing individual screens.
- Rationale: The spec’s target is a workspace-like admin feel, and the shell is the strongest visual signal of that goal.
- Alternatives considered: Starting with tables or forms would create local improvements but leave the global experience visibly mismatched.

## 2) Bootstrap remains the foundation

- Decision: Keep Bootstrap as the implementation base and layer only minimal custom CSS on top.
- Rationale: The codebase already uses Bootstrap classes and components; the feature is presentation-only and should avoid a larger styling migration.
- Alternatives considered: A custom design system or full CSS rewrite would be more flexible, but it would increase risk and slow the refactor.

## 3) The mobile sidebar stays offcanvas-based

- Decision: Preserve the existing mobile navigation pattern and refine its density, spacing, and close behavior.
- Rationale: The code already has a responsive offcanvas sidebar, so the best use of effort is to make it feel intentional and aligned with the new shell.
- Alternatives considered: Replacing mobile navigation with a separate compact menu would create a second navigation model and add unnecessary complexity.

## 4) Page headers become the common organizing pattern

- Decision: Standardize page headers as eyebrow/title/description/action units across all admin screens.
- Rationale: Emdash-like admin interfaces depend on a consistent page framing pattern that separates navigation from page-specific work.
- Alternatives considered: Letting each page keep its current header arrangement would preserve the current inconsistency.

## 5) CRUD density should increase without becoming cramped

- Decision: Move toward denser cards, tables, and forms while preserving readability and usable touch targets.
- Rationale: The current admin is readable but feels more generic than polished; denser spacing will make it feel closer to a workspace product.
- Alternatives considered: Keeping the current generous spacing would remain safe but would not materially improve the feel of the product.

