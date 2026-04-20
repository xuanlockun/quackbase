CREATE TABLE IF NOT EXISTS form_fields (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT NOT NULL CHECK (type IN ('text', 'email', 'textarea')),
	label TEXT NOT NULL,
	required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
	sort_order INTEGER NOT NULL DEFAULT 1,
	updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_fields_sort_order ON form_fields (sort_order ASC, id ASC);

CREATE TABLE IF NOT EXISTS form_submissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	language TEXT NOT NULL,
	source_path TEXT,
	values_json TEXT NOT NULL,
	submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at
	ON form_submissions (submitted_at DESC, id DESC);
