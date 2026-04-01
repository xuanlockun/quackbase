# Data Model: Admin Authentication RBAC

## Users

**Purpose**: Stores admin-capable user identities, password hashes, and account status.

**Fields**

- `id`: Integer primary key.
- `email`: Unique normalized email address used for login.
- `password_hash`: Bcrypt hash of the user’s password.
- `display_name`: Human-readable name shown in the admin UI.
- `is_active`: Boolean-like flag indicating whether the user can authenticate.
- `created_at`: Timestamp for user creation.
- `updated_at`: Timestamp for last profile update.
- `last_login_at`: Nullable timestamp updated after successful login.

**Validation Rules**

- Email is required, normalized to lowercase, and unique.
- Password hash is required for all password-based accounts.
- Inactive users cannot receive a valid admin session.

**Relationships**

- Many-to-many with `roles` through `user_roles`.

## Roles

**Purpose**: Represents reusable access bundles for admin users.

**Fields**

- `id`: Integer primary key.
- `name`: Unique internal role identifier.
- `label`: Human-readable role name shown in the UI.
- `description`: Optional explanation of the role’s purpose.
- `is_system`: Boolean-like flag for protected built-in roles such as `superadmin` and `editor`.
- `created_at`: Timestamp for role creation.
- `updated_at`: Timestamp for last role change.

**Validation Rules**

- Role name is required and unique.
- System roles cannot be deleted.
- Roles assigned to users cannot be deleted until assignments are removed.

**Relationships**

- Many-to-many with `users` through `user_roles`.
- Many-to-many with `permissions` through `role_permissions`.

## Permissions

**Purpose**: Defines discrete admin capabilities that can be assigned to roles.

**Fields**

- `id`: Integer primary key.
- `name`: Unique permission key such as `create_post` or `manage_roles`.
- `label`: Human-readable permission name for the UI.
- `description`: Optional explanation of the capability.
- `resource`: Logical area such as `posts`, `users`, or `roles`.
- `action`: Logical action such as `create`, `read`, `update`, `delete`, or `assign`.
- `created_at`: Timestamp for permission creation.

**Validation Rules**

- Permission name is required and unique.
- Permission keys are stable identifiers used in middleware and policies.

**Relationships**

- Many-to-many with `roles` through `role_permissions`.

## User Roles

**Purpose**: Connects users to roles.

**Fields**

- `user_id`: Foreign key to `users.id`.
- `role_id`: Foreign key to `roles.id`.
- `assigned_at`: Timestamp for assignment creation.
- `assigned_by_user_id`: Nullable foreign key to the superadmin who made the change.

**Validation Rules**

- Each `user_id` and `role_id` pair must be unique.
- Assignments reference existing users and roles only.

**Relationships**

- Belongs to one `user`.
- Belongs to one `role`.

## Role Permissions

**Purpose**: Connects roles to permissions.

**Fields**

- `role_id`: Foreign key to `roles.id`.
- `permission_id`: Foreign key to `permissions.id`.
- `assigned_at`: Timestamp for assignment creation.
- `assigned_by_user_id`: Nullable foreign key to the superadmin who made the change.

**Validation Rules**

- Each `role_id` and `permission_id` pair must be unique.
- Assignments reference existing roles and permissions only.

**Relationships**

- Belongs to one `role`.
- Belongs to one `permission`.

## Derived Access Model

- A user’s effective permissions are the union of all permissions granted through all assigned roles.
- `superadmin` is a protected system role seeded with the complete permission catalog.
- `editor` is a protected system role seeded only with content-management permissions.
- Authorization decisions are recalculated from D1 on every protected request rather than cached inside the JWT.

## State Transitions

### User Authentication

1. User submits email and password.
2. System looks up the user by normalized email.
3. System rejects login if the user does not exist, is inactive, or the bcrypt check fails.
4. System issues a signed JWT cookie if the password is valid and the user has at least one admin role.
5. System clears the cookie on logout.

### Role Lifecycle

1. Superadmin creates a custom role.
2. Superadmin assigns permissions to the role.
3. Superadmin assigns the role to one or more users.
4. Superadmin can update the role metadata and permission set.
5. Superadmin can delete the role only when it is non-system and has no active user assignments.

### Permission Enforcement

1. Middleware or API guard reads the JWT cookie.
2. System verifies the JWT signature and extracts the user identifier.
3. System loads the user’s current roles and effective permissions from D1.
4. System allows or denies the page/API action based on the required permission set.
