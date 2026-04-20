CREATE TABLE IF NOT EXISTS posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	content_markdown TEXT NOT NULL,
	hero_image TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	pub_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status_pub_date
ON posts (status, pub_date DESC);
