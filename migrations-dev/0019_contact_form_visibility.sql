ALTER TABLE contact_forms ADD COLUMN show_title INTEGER NOT NULL DEFAULT 1 CHECK (show_title IN (0, 1));
ALTER TABLE contact_forms ADD COLUMN show_description INTEGER NOT NULL DEFAULT 1 CHECK (show_description IN (0, 1));
ALTER TABLE contact_forms ADD COLUMN form_title TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_forms ADD COLUMN form_description TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_forms ADD COLUMN show_form_title INTEGER NOT NULL DEFAULT 1 CHECK (show_form_title IN (0, 1));
ALTER TABLE contact_forms ADD COLUMN show_form_description INTEGER NOT NULL DEFAULT 1 CHECK (show_form_description IN (0, 1));
