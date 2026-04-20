CREATE TABLE IF NOT EXISTS media_assets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	storage_provider TEXT NOT NULL CHECK (storage_provider IN ('r2', 's3')),
	object_key TEXT NOT NULL UNIQUE,
	file_name TEXT NOT NULL,
	mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
	size_bytes INTEGER NOT NULL DEFAULT 0,
	public_url TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
ON media_assets (created_at DESC, id DESC);
