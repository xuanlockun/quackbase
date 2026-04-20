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

CREATE TABLE IF NOT EXISTS languages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
	is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_languages_enabled ON languages (enabled);

CREATE TABLE IF NOT EXISTS translation_entries (
	locale_code TEXT NOT NULL,
	translation_key TEXT NOT NULL,
	translated_value TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (locale_code, translation_key)
);

CREATE INDEX IF NOT EXISTS idx_translation_entries_locale ON translation_entries (locale_code);
CREATE INDEX IF NOT EXISTS idx_translation_entries_key ON translation_entries (translation_key);

CREATE TABLE IF NOT EXISTS navigation_items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL,
	href TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS site_settings (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	site_title TEXT NOT NULL DEFAULT 'Edge CMS',
	home_page_slug TEXT NOT NULL DEFAULT 'home',
	favicon_url TEXT NOT NULL DEFAULT '/favicon.svg',
	logo_url TEXT NOT NULL DEFAULT '',
	media_s3_endpoint TEXT NOT NULL DEFAULT '',
	media_s3_bucket TEXT NOT NULL DEFAULT '',
	media_s3_public_base_url TEXT NOT NULL DEFAULT '',
	media_s3_access_key_id TEXT NOT NULL DEFAULT '',
	media_s3_secret_access_key TEXT NOT NULL DEFAULT '',
	media_s3_region TEXT NOT NULL DEFAULT 'auto',
	media_s3_force_path_style TEXT NOT NULL DEFAULT '1',
	header_background TEXT NOT NULL DEFAULT '#ffffff',
	header_text_color TEXT NOT NULL DEFAULT '#0f1219',
	header_accent_color TEXT NOT NULL DEFAULT '#2337ff',
	header_template_html TEXT NOT NULL DEFAULT '',
	navbar_template_html TEXT NOT NULL DEFAULT '',
	page_template_html TEXT NOT NULL DEFAULT '',
	blog_feed_template_html TEXT NOT NULL DEFAULT '',
	nav_items TEXT NOT NULL DEFAULT '[]',
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS footer_settings (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	footer_text TEXT NOT NULL DEFAULT 'Edge CMS. Content updates go live straight from D1.',
	footer_background TEXT NOT NULL DEFAULT '#eef2f7',
	footer_text_color TEXT NOT NULL DEFAULT '#60739f',
	footer_template_html TEXT NOT NULL DEFAULT '',
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_pages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	description TEXT NOT NULL,
	content TEXT NOT NULL,
	show_title INTEGER NOT NULL DEFAULT 1,
	show_posts_section INTEGER NOT NULL DEFAULT 0,
	page_sections TEXT NOT NULL DEFAULT '[]',
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_pages_status_updated_at
ON site_pages (status, updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	content TEXT NOT NULL,
	hero_image TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	pub_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status_pub_date
ON posts (status, pub_date DESC);

CREATE TABLE IF NOT EXISTS banners (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	image_url TEXT NOT NULL,
	headline TEXT NOT NULL DEFAULT '',
	caption TEXT NOT NULL DEFAULT '',
	alt_text TEXT NOT NULL DEFAULT '',
	link_url TEXT NOT NULL DEFAULT '',
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	sort_order INTEGER NOT NULL DEFAULT 0,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_sort_order
ON banners (sort_order ASC, id ASC);

CREATE TABLE IF NOT EXISTS contact_forms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT NOT NULL DEFAULT '',
	layout TEXT NOT NULL DEFAULT 'split',
	background_style TEXT NOT NULL DEFAULT 'solid',
	background_color TEXT NOT NULL DEFAULT '#f8fbff',
	button_color TEXT NOT NULL DEFAULT '#4f80ff',
	fields_json TEXT NOT NULL DEFAULT '[]',
	is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
	sort_order INTEGER NOT NULL DEFAULT 0,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_forms_sort_order
ON contact_forms (sort_order ASC, id ASC);

CREATE TABLE IF NOT EXISTS form_fields (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT NOT NULL CHECK (type IN ('text', 'email', 'textarea')),
	label TEXT NOT NULL,
	required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
	sort_order INTEGER NOT NULL DEFAULT 1,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_fields_sort_order
ON form_fields (sort_order ASC, id ASC);

CREATE TABLE IF NOT EXISTS form_submissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	contact_form_id INTEGER NOT NULL DEFAULT 0,
	language TEXT NOT NULL,
	source_path TEXT,
	values_json TEXT NOT NULL,
	submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at
ON form_submissions (submitted_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_form_id
ON form_submissions (contact_form_id ASC, submitted_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS media_assets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	storage_provider TEXT NOT NULL CHECK (storage_provider IN ('r2', 's3')),
	object_key TEXT NOT NULL UNIQUE,
	file_name TEXT NOT NULL,
	mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
	size_bytes INTEGER NOT NULL DEFAULT 0,
	public_url TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
ON media_assets (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS media_folders (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	folder_path TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_folders_created_at
ON media_folders (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS admin_secrets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	secret_type TEXT NOT NULL CHECK (secret_type IN ('cloudflare_api_access_token', 'media_s3_access_key_id', 'media_s3_secret_access_key')),
	label TEXT NOT NULL,
	encrypted_value TEXT NOT NULL,
	iv TEXT NOT NULL,
	value_last4 TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_secrets_created_at
ON admin_secrets (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_admin_secrets_type_updated_at
ON admin_secrets (secret_type, updated_at DESC, id DESC);

INSERT INTO permissions (name, label, description, resource, action)
VALUES
	('posts.read', 'View posts', 'View blog post records.', 'posts', 'read'),
	('posts.create', 'Create posts', 'Create blog posts.', 'posts', 'create'),
	('posts.update', 'Edit posts', 'Edit blog posts.', 'posts', 'update'),
	('posts.delete', 'Delete posts', 'Delete blog posts.', 'posts', 'delete'),
	('pages.read', 'View pages', 'View site page records.', 'pages', 'read'),
	('pages.create', 'Create pages', 'Create site pages.', 'pages', 'create'),
	('pages.update', 'Edit pages', 'Edit site pages.', 'pages', 'update'),
	('pages.delete', 'Delete pages', 'Delete site pages.', 'pages', 'delete'),
	('banners.read', 'View banners', 'View banner slide records.', 'banners', 'read'),
	('banners.manage', 'Manage banners', 'Create, edit, and delete banner slides.', 'banners', 'manage'),
	('contactForms.read', 'View contact forms', 'View contact form libraries and submitted leads.', 'contact_forms', 'read'),
	('contactForms.manage', 'Manage contact forms', 'Create, edit, and delete contact forms and their fields.', 'contact_forms', 'manage'),
	('languages.manage', 'Manage languages', 'Create and edit supported site languages and translations.', 'languages', 'manage'),
	('site.manage', 'Manage site settings', 'Update site-wide settings, templates, media, and navigation.', 'site', 'manage'),
	('users.manage', 'Manage users', 'Create and edit admin users.', 'users', 'manage'),
	('roles.manage', 'Manage roles', 'Create and edit roles.', 'roles', 'manage'),
	('permissions.read', 'View permissions', 'View the permission catalog.', 'permissions', 'read')
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

INSERT INTO languages (code, name, enabled, is_default)
VALUES
	('en', 'English', 1, 1),
	('vi', 'Vietnamese', 1, 0),
	('jp', 'Japanese', 1, 0)
ON CONFLICT(code) DO NOTHING;

UPDATE languages SET is_default = 0 WHERE code != 'en';
UPDATE languages SET is_default = 1 WHERE code = 'en';

INSERT INTO site_settings (
	id,
	site_title,
	home_page_slug,
	favicon_url,
	logo_url,
	media_s3_endpoint,
	media_s3_bucket,
	media_s3_public_base_url,
	media_s3_access_key_id,
	media_s3_secret_access_key,
	media_s3_region,
	media_s3_force_path_style,
	header_background,
	header_text_color,
	header_accent_color,
	header_template_html,
	navbar_template_html,
	page_template_html,
	blog_feed_template_html,
	nav_items
)
VALUES (
	1,
	'Edge CMS',
	'home',
	'/favicon.svg',
	'',
	'',
	'',
	'',
	'',
	'',
	'auto',
	'1',
	'#ffffff',
	'#0f1219',
	'#2337ff',
	'',
	'',
	'<section class="page-shell">{{content}}</section>',
	'<section class="mb-5">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="h4 mb-0">{{heading}}</h2>
    <a class="btn btn-sm btn-outline-primary" href="{{viewAllHref}}">{{viewAllLabel}}</a>
  </div>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {{posts}}
  </div>
</section>',
	'[]'
)
ON CONFLICT(id) DO NOTHING;

INSERT INTO footer_settings (id, footer_text, footer_background, footer_text_color, footer_template_html)
VALUES (1, 'Edge CMS. Content updates go live straight from D1.', '#eef2f7', '#60739f', '')
ON CONFLICT(id) DO NOTHING;

INSERT INTO navigation_items (label, href, sort_order, is_visible)
SELECT json_object('en', 'Home', 'vi', 'Trang chu'), '/', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM navigation_items);

INSERT INTO site_pages (title, slug, description, content, show_title, show_posts_section, status, updated_at, page_sections)
VALUES (
	json_object('en', 'Hello World', 'vi', 'Xin chao'),
	'home',
	'Welcome to Edge CMS.',
	json_object('en', 'Your new Edge CMS project is ready.'),
	1,
	1,
	'published',
	CURRENT_TIMESTAMP,
	'["page_content","blog_feed"]'
)
ON CONFLICT(slug) DO NOTHING;

INSERT INTO posts (slug, title, description, content, hero_image, status, pub_date, updated_date)
VALUES (
	'hello-world',
	json_object('en', 'Hello World', 'vi', 'Xin chao'),
	'Your first published post.',
	json_object('en', 'This is the first post in your Edge CMS install.'),
	NULL,
	'published',
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP
);

