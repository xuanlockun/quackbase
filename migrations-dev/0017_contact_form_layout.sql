ALTER TABLE contact_forms ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_forms ADD COLUMN layout TEXT NOT NULL DEFAULT 'split';
ALTER TABLE contact_forms ADD COLUMN background_style TEXT NOT NULL DEFAULT 'solid';
ALTER TABLE contact_forms ADD COLUMN background_color TEXT NOT NULL DEFAULT '#f8fbff';
ALTER TABLE contact_forms ADD COLUMN button_color TEXT NOT NULL DEFAULT '#4f80ff';
