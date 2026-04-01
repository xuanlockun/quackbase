# Quickstart: Admin Authentication RBAC

## 1. Prepare environment

1. Ensure `wrangler.json` includes the `DB` D1 binding for the target environment.
2. Add a Worker secret for the JWT signing key:
   `wrangler secret put JWT_SECRET`
3. Install dependencies with `npm install`.

## 2. Apply the RBAC migration

1. Apply `migrations/0002_admin_auth_rbac.sql` to the target D1 database.
2. Confirm the migration created `users`, `roles`, `permissions`, `user_roles`, and `role_permissions`.
3. Confirm the seeded system roles exist:
   `superadmin`
   `editor`
4. Confirm the permission catalog includes the seeded post, page, site, user, role, and permission capabilities.

## 3. Bootstrap the first superadmin

1. Generate a bcrypt hash for the initial password. One option is:
   `node -e "import('bcryptjs').then(async ({ hash }) => console.log(await hash('change-me-now', 12)))"`
2. Insert the initial user into D1 with the generated hash.
3. Assign the `superadmin` role to that user by inserting into `user_roles`.
4. Keep the bootstrap password temporary and rotate it after first login.

## 4. Available admin routes

1. Login page: `/admin/login`
2. Content pages: `/admin/posts`, `/admin/pages`
3. Site settings: `/admin/header`
4. RBAC governance: `/admin/users`, `/admin/roles`, `/admin/permissions`

## 5. Available admin APIs

1. Auth:
   `POST /api/admin/auth/login`
   `POST /api/admin/auth/logout`
2. Users:
   `GET /api/admin/users`
   `POST /api/admin/users`
   `PATCH /api/admin/users/{userId}`
3. Roles:
   `GET /api/admin/roles`
   `POST /api/admin/roles`
   `PATCH /api/admin/roles/{roleId}`
   `DELETE /api/admin/roles/{roleId}`
4. Permissions:
   `GET /api/admin/permissions`

## 6. Validate end to end

1. Run `npm test`.
2. Run `npm run check`.
3. Verify an unauthenticated request to `/admin/posts` redirects to `/admin/login`.
4. Verify a superadmin can log in, create a role, assign permissions, and assign that role to a user.
5. Verify an editor can manage posts and pages but cannot access `/admin/users`, `/admin/roles`, or `/admin/permissions`.
6. Verify removing a role or permission takes effect on the next protected request.
