-- Dynamic language catalog (009-dynamic-multilang-i18n)

CREATE TABLE IF NOT EXISTS languages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
	is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_languages_enabled ON languages (enabled);

INSERT INTO languages (code, name, enabled, is_default)
VALUES
	('en', 'English', 1, 1),
	('vi', 'Vietnamese', 1, 0)
ON CONFLICT(code) DO NOTHING;

-- Ensure exactly one default when rows exist from legacy DBs
UPDATE languages SET is_default = 0 WHERE code != 'en';
UPDATE languages SET is_default = 1 WHERE code = 'en';

INSERT INTO permissions (name, label, description, resource, action)
VALUES (
	'languages.manage',
	'Manage languages',
	'Create, enable, disable, and set the default site language.',
	'languages',
	'manage'
)
ON CONFLICT(name) DO UPDATE SET
	label = excluded.label,
	description = excluded.description,
	resource = excluded.resource,
	action = excluded.action;

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions
WHERE roles.name = 'superadmin'
	AND permissions.name = 'languages.manage';
