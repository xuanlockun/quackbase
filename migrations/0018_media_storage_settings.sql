ALTER TABLE site_settings ADD COLUMN media_s3_endpoint TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_bucket TEXT NOT NULL DEFAULT '';
ALTER TABLE site_settings ADD COLUMN media_s3_public_base_url TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS idx_admin_secrets_created_at;
ALTER TABLE admin_secrets RENAME TO admin_secrets_legacy;

CREATE TABLE admin_secrets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	secret_type TEXT NOT NULL CHECK (secret_type IN ('cloudflare_api_access_token', 'media_s3_access_key_id', 'media_s3_secret_access_key')),
	label TEXT NOT NULL,
	encrypted_value TEXT NOT NULL,
	iv TEXT NOT NULL,
	value_last4 TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_secrets (id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at)
SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
FROM admin_secrets_legacy;

DROP TABLE admin_secrets_legacy;

CREATE INDEX IF NOT EXISTS idx_admin_secrets_created_at
	ON admin_secrets (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_admin_secrets_type_updated_at
	ON admin_secrets (secret_type, updated_at DESC, id DESC);
