ALTER TABLE site_settings ADD COLUMN media_s3_endpoint TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_bucket TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_public_base_url TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_access_key_id TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_secret_access_key TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_region TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE site_settings ADD COLUMN media_s3_force_path_style TEXT NOT NULL DEFAULT '1';
