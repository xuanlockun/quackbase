CREATE TABLE IF NOT EXISTS admin_secrets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	secret_type TEXT NOT NULL CHECK (secret_type = 'cloudflare_api_access_token'),
	label TEXT NOT NULL,
	encrypted_value TEXT NOT NULL,
	iv TEXT NOT NULL,
	value_last4 TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_secrets_created_at
	ON admin_secrets (created_at DESC, id DESC);
