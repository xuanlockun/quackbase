-- Admin template HTML storage for site settings

ALTER TABLE site_settings ADD COLUMN admin_template_html TEXT NOT NULL DEFAULT '';

UPDATE site_settings
SET admin_template_html = COALESCE(admin_template_html, '')
WHERE id = 1;
