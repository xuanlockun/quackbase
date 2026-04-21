ALTER TABLE contact_forms ADD COLUMN use_captcha INTEGER NOT NULL DEFAULT 0 CHECK (use_captcha IN (0, 1));
