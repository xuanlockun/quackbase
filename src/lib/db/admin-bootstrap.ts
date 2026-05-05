const ADMIN_PERMISSION_ROWS = [
	["posts.read", "View posts", "View blog post records.", "posts", "read"],
	["posts.create", "Create posts", "Create blog posts.", "posts", "create"],
	["posts.update", "Edit posts", "Edit blog posts.", "posts", "update"],
	["posts.delete", "Delete posts", "Delete blog posts.", "posts", "delete"],
	["pages.read", "View pages", "View site page records.", "pages", "read"],
	["pages.create", "Create pages", "Create site pages.", "pages", "create"],
	["pages.update", "Edit pages", "Edit site pages.", "pages", "update"],
	["pages.delete", "Delete pages", "Delete site pages.", "pages", "delete"],
	["banners.read", "View banners", "View banner slide records.", "banners", "read"],
	["banners.manage", "Manage banners", "Create, edit, and delete banner slides.", "banners", "manage"],
	["contactForms.read", "View contact forms", "View contact form libraries and submitted leads.", "contact_forms", "read"],
	["contactForms.manage", "Manage contact forms", "Create, edit, and delete contact forms and their fields.", "contact_forms", "manage"],
	["languages.manage", "Manage languages", "Create and edit supported site languages and translations.", "languages", "manage"],
	["site.manage", "Manage site settings", "Update site-wide settings, templates, media, and navigation.", "site", "manage"],
	["users.manage", "Manage users", "Create and edit admin users.", "users", "manage"],
	["roles.manage", "Manage roles", "Create and edit roles.", "roles", "manage"],
	["permissions.read", "View permissions", "View the permission catalog.", "permissions", "read"],
] as const;

const EDITOR_PERMISSION_NAMES = [
	"posts.read",
	"posts.create",
	"posts.update",
	"posts.delete",
	"pages.read",
	"pages.create",
	"pages.update",
	"pages.delete",
] as const;

export async function ensureAdminBootstrapSchema(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				email TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				display_name TEXT NOT NULL,
				is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				last_login_at TEXT
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS roles (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE,
				label TEXT NOT NULL,
				description TEXT,
				is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS permissions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE,
				label TEXT NOT NULL,
				description TEXT,
				resource TEXT NOT NULL,
				action TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS user_roles (
				user_id INTEGER NOT NULL,
				role_id INTEGER NOT NULL,
				assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				assigned_by_user_id INTEGER,
				PRIMARY KEY (user_id, role_id),
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
				FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS role_permissions (
				role_id INTEGER NOT NULL,
				permission_id INTEGER NOT NULL,
				assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				assigned_by_user_id INTEGER,
				PRIMARY KEY (role_id, permission_id),
				FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
				FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
				FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
			)`,
		),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id)`),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id)`),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions (resource, action)`),
	]);

	for (const [name, label, description, resource, action] of ADMIN_PERMISSION_ROWS) {
		await db
			.prepare(
				`INSERT INTO permissions (name, label, description, resource, action)
				VALUES (?1, ?2, ?3, ?4, ?5)
				ON CONFLICT(name) DO UPDATE SET
					label = excluded.label,
					description = excluded.description,
					resource = excluded.resource,
					action = excluded.action`,
			)
			.bind(name, label, description, resource, action)
			.run();
	}

	await db.batch([
		db
			.prepare(
				`INSERT INTO roles (name, label, description, is_system)
				VALUES ('superadmin', 'Superadmin', 'Full access to all admin features.', 1)
				ON CONFLICT(name) DO UPDATE SET
					label = excluded.label,
					description = excluded.description,
					is_system = excluded.is_system,
					updated_at = CURRENT_TIMESTAMP`,
			),
		db
			.prepare(
				`INSERT INTO roles (name, label, description, is_system)
				VALUES ('editor', 'Editor', 'Content-focused admin access without RBAC governance.', 1)
				ON CONFLICT(name) DO UPDATE SET
					label = excluded.label,
					description = excluded.description,
					is_system = excluded.is_system,
					updated_at = CURRENT_TIMESTAMP`,
			),
	]);

	await db.prepare(`DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1)`).run();
	await db.prepare(
		`INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
		SELECT roles.id, permissions.id
		FROM roles
		JOIN permissions
		WHERE roles.name = 'superadmin'`,
	).run();

	await db.prepare(`DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'editor' LIMIT 1)`).run();
	for (const permissionName of EDITOR_PERMISSION_NAMES) {
		await db
			.prepare(
				`INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
				SELECT roles.id, permissions.id
				FROM roles
				JOIN permissions
				WHERE roles.name = 'editor' AND permissions.name = ?1`,
			)
			.bind(permissionName)
			.run();
	}
}

