ALTER TABLE site_settings ADD COLUMN captcha_enabled TEXT NOT NULL DEFAULT '0';
ALTER TABLE site_settings ADD COLUMN captcha_site_key TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN captcha_secret_key TEXT NOT NULL DEFAULT '';
