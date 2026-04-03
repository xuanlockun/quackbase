# Product Workflow

This document explains the full workflow for this repository.

The short version is:

- `specify -> plan -> tasks -> implement` is correct
- but it is only the feature execution workflow
- it is not the entire product workflow from raw customer input

## Correct End-To-End Flow

The recommended flow for this project is:

1. Raw customer request
2. Rewrite into a clear standard requirement
3. Analyze business workflow
4. Add non-functional requirements and delivery constraints
5. Split into feature-sized specifications
6. Run each feature through Speckit
7. Implement, verify, and release

## Step 1: Raw Customer Request

This is the messy version of the requirement.

Example for this repo:

"Need a CMS that can manage content, customize style, publish blog posts, support admin login, RBAC, multilingual content, and other future extensions."

At this stage, the goal is not precision. The goal is to capture intent.

## Step 2: Rewrite Into Standard Requirements

Here we normalize the raw request into language the team can work with.

Typical outputs:

- scope statement
- business goals
- user types
- major capabilities
- what is explicitly out of scope for now

For this project, that rewrite might become:

- the product is a runtime CMS on Astro + D1
- administrators manage posts, pages, and selected site configuration
- the admin area requires authentication and role-based authorization
- content and UI need multilingual support
- public content may use localized URLs
- some frontend sections such as forms should become configurable without code changes

## Step 3: Analyze Business Workflow

This is where the team describes how the system is supposed to behave in real usage.

Examples:

- how an admin signs in and reaches the dashboard
- how an editor creates and publishes content
- how a visitor switches language and views localized content
- how a site admin configures a dynamic contact form
- how permissions affect visible admin actions

This step prevents feature specs from being technically correct but operationally disconnected.

## Step 4: Add Non-Functional Requirements

These are not just "nice to have". They shape the specs.

Examples relevant to this repo:

- security for admin routes and sessions
- authorization enforcement
- multilingual fallback behavior
- usability on desktop and mobile
- maintainable routing and admin UX consistency
- compatibility with Astro + Cloudflare Workers + D1

## Step 5: Split Into Feature-Sized Specs

Only after the product requirement is clearer should we break the work into separate features.

Examples already reflected in `specs/`:

- `001-admin-auth-rbac`
- `002-admin-ui-refactor`
- `003-dense-admin-ui`
- `004-admin-crud-layout`
- `005-content-i18n`
- `006-ui-text-i18n`
- `007-localized-post-urls`
- `008-dynamic-form-ui`

This is the point where a broad CMS vision becomes implementable.

## Step 6: Run Each Feature Through Speckit

For each feature, the Speckit workflow is:

1. `specify`
2. `plan`
3. `tasks`
4. `implement`

In this repository, that usually maps to:

- `spec.md`
- `plan.md`
- `tasks.md`
- source code and migrations

So yes: Speckit is still the right workflow, but it should operate on already-separated feature specs rather than on the raw product idea directly.

## Step 7: Implement, Verify, Release

After implementation:

- run checks and tests
- validate the feature against the spec
- make sure the feature still fits the product-level workflow
- document any new architectural or operational assumptions

## Practical Rule For This Repo

When a new request arrives, use this decision rule:

- if it is still broad and product-level, write or update a product/discovery document first
- if it is already a clearly bounded feature, write a new Speckit spec in `specs/<feature>/`

## Is It Too Late To Write This Now?

No. Writing this after some specs and code already exist is still a good correction.

In fact, it is often the healthiest move because it:

- explains why the current specs exist
- restores the missing product-level narrative
- makes future specs more consistent
- helps new contributors understand the difference between product discovery and feature execution

## Suggested Documentation Layers

To keep the project clean, use this structure:

- `README.md`: short repo overview and navigation
- `docs/product-workflow.md`: full end-to-end requirement and delivery workflow
- `specs/<feature>/`: feature-level Speckit artifacts

That way:

- README stays readable
- product thinking is documented explicitly
- feature delivery stays modular
