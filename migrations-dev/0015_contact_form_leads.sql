ALTER TABLE form_submissions ADD COLUMN contact_form_id INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_form_id
	ON form_submissions (contact_form_id ASC, submitted_at DESC, id DESC);
