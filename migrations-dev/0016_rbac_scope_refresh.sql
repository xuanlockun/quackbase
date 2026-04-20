INSERT INTO permissions (name, label, description, resource, action)
VALUES
	('banners.read', 'View banners', 'View banner slide records in the admin CMS.', 'banners', 'read'),
	('banners.manage', 'Manage banners', 'Create, edit, and delete banner slides.', 'banners', 'manage'),
	('contactForms.read', 'View contact forms', 'View contact forms and submitted leads.', 'contact_forms', 'read')
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
	AND permissions.name IN (
		'banners.read',
		'banners.manage',
		'contactForms.read'
	);
