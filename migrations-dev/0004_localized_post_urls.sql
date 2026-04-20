PRAGMA foreign_keys=off;

ALTER TABLE posts RENAME TO posts_legacy;

CREATE TABLE posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	content TEXT NOT NULL,
	hero_image TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	pub_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (id, slug, title, description, content, hero_image, status, pub_date, updated_date)
SELECT
	id,
	CASE
		WHEN json_valid(slug) THEN slug
		ELSE json_object('en', slug)
	END,
	CASE
		WHEN json_valid(title) THEN title
		ELSE json_object('en', title)
	END,
	CASE
		WHEN json_valid(description) THEN description
		ELSE json_object('en', description)
	END,
	CASE
		WHEN json_valid(content) THEN content
		ELSE json_object('en', content)
	END,
	hero_image,
	status,
	pub_date,
	updated_date
FROM posts_legacy;

DROP TABLE posts_legacy;

CREATE INDEX idx_posts_status_pub_date ON posts (status, pub_date DESC);

PRAGMA foreign_keys=on;
