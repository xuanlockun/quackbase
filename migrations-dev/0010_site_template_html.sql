-- Header and navbar template HTML storage for site settings

ALTER TABLE site_settings ADD COLUMN header_template_html TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN navbar_template_html TEXT NOT NULL DEFAULT '';

UPDATE site_settings
SET header_template_html = COALESCE(header_template_html, ''),
	navbar_template_html = COALESCE(navbar_template_html, '')
WHERE id = 1;
