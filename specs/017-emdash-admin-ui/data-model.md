# Data Model: Emdash-Inspired Admin UI Refactor

This feature does not introduce new persisted business data. The relevant model is the presentation structure that the admin UI reuses across screens.

## Admin Shell

- **Purpose**: Shared frame that contains the navigation rail, utility bar, page header, and content canvas.
- **Key parts**:
  - persistent sidebar
  - top utility area
  - page header block
  - main content canvas
- **Relationships**:
  - Wraps every admin route
  - Hosts all CRUD surfaces

## Navigation Group

- **Purpose**: A grouped set of sidebar destinations used to preserve scanability and RBAC-driven visibility.
- **Key parts**:
  - group label
  - permitted links
  - active/current state
  - icon/marker treatment
- **Relationships**:
  - Belongs to the admin shell
  - Maps to existing route permissions

## CRUD Surface

- **Purpose**: Any list or editor screen used to manage content or admin resources.
- **Key parts**:
  - page header
  - table or form body
  - action area
  - empty/error/info state
- **Relationships**:
  - Uses the shared admin shell
  - Reuses the standard page-header pattern

## State Panel

- **Purpose**: Standardized treatment for empty, loading, error, or informative states.
- **Key parts**:
  - short title or summary
  - supporting text
  - optional action button
- **Relationships**:
  - Appears inside CRUD surfaces
  - Shares spacing and tone with cards and forms

## Validation Rules

- The shell must preserve all current routes and behavior.
- Navigation groups must respect existing RBAC visibility.
- CRUD surfaces must not introduce page-specific visual systems that break consistency.
- State panels must remain legible at desktop and mobile widths.

