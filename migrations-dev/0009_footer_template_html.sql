-- Footer template HTML storage for site settings

ALTER TABLE footer_settings ADD COLUMN footer_template_html TEXT NOT NULL DEFAULT '';

UPDATE footer_settings
SET footer_template_html = COALESCE(footer_template_html, '')
WHERE id = 1;
