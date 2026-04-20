-- Translation entries table for dynamic localization (013-d1-localization-migration)

CREATE TABLE IF NOT EXISTS translation_entries (
	locale_code TEXT NOT NULL,
	translation_key TEXT NOT NULL,
	translated_value TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY (locale_code, translation_key)
);

CREATE INDEX IF NOT EXISTS idx_translation_entries_locale ON translation_entries (locale_code);
CREATE INDEX IF NOT EXISTS idx_translation_entries_key ON translation_entries (translation_key);
