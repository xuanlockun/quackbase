CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	display_name TEXT NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS roles (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	label TEXT NOT NULL,
	description TEXT,
	is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	label TEXT NOT NULL,
	description TEXT,
	resource TEXT NOT NULL,
	action TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
	user_id INTEGER NOT NULL,
	role_id INTEGER NOT NULL,
	assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	assigned_by_user_id INTEGER,
	PRIMARY KEY (user_id, role_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
	FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
	role_id INTEGER NOT NULL,
	permission_id INTEGER NOT NULL,
	assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	assigned_by_user_id INTEGER,
	PRIMARY KEY (role_id, permission_id),
	FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
	FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
	FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions (resource, action);

INSERT INTO permissions (name, label, description, resource, action)
VALUES
	('posts.read', 'View posts', 'View post records in the admin CMS.', 'posts', 'read'),
	('posts.create', 'Create posts', 'Create new blog posts.', 'posts', 'create'),
	('posts.update', 'Edit posts', 'Update existing blog posts.', 'posts', 'update'),
	('posts.delete', 'Delete posts', 'Delete existing blog posts.', 'posts', 'delete'),
	('pages.read', 'View pages', 'View site page records in the admin CMS.', 'pages', 'read'),
	('pages.create', 'Create pages', 'Create new site pages.', 'pages', 'create'),
	('pages.update', 'Edit pages', 'Update existing site pages.', 'pages', 'update'),
	('pages.delete', 'Delete pages', 'Delete existing site pages.', 'pages', 'delete'),
	('site.manage', 'Manage site settings', 'Update navigation and site chrome settings.', 'site', 'manage'),
	('users.manage', 'Manage users', 'Create and edit admin-capable users.', 'users', 'manage'),
	('roles.manage', 'Manage roles', 'Create, edit, and delete roles.', 'roles', 'manage'),
	('permissions.read', 'View permissions', 'Review the current permission catalog.', 'permissions', 'read')
ON CONFLICT(name) DO UPDATE SET
	label = excluded.label,
	description = excluded.description,
	resource = excluded.resource,
	action = excluded.action;

INSERT INTO roles (name, label, description, is_system)
VALUES
	('superadmin', 'Superadmin', 'Full access to all admin features.', 1),
	('editor', 'Editor', 'Content-focused admin access without RBAC governance.', 1)
ON CONFLICT(name) DO UPDATE SET
	label = excluded.label,
	description = excluded.description,
	is_system = excluded.is_system,
	updated_at = CURRENT_TIMESTAMP;

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions
WHERE roles.name = 'superadmin';

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions
WHERE roles.name = 'editor'
	AND permissions.name IN (
		'posts.read',
		'posts.create',
		'posts.update',
		'posts.delete',
		'pages.read',
		'pages.create',
		'pages.update',
		'pages.delete'
	);
