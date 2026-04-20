-- ALTER TABLE contact_forms ADD COLUMN show_title INTEGER NOT NULL DEFAULT 1 CHECK (show_title IN (0, 1));
-- ALTER TABLE contact_forms ADD COLUMN show_description INTEGER NOT NULL DEFAULT 1 CHECK (show_description IN (0, 1));
-- ALTER TABLE contact_forms ADD COLUMN form_title TEXT NOT NULL DEFAULT '';
-- ALTER TABLE contact_forms ADD COLUMN form_description TEXT NOT NULL DEFAULT '';
-- ALTER TABLE contact_forms ADD COLUMN show_form_title INTEGER NOT NULL DEFAULT 1 CHECK (show_form_title IN (0, 1));
-- ALTER TABLE contact_forms ADD COLUMN show_form_description INTEGER NOT NULL DEFAULT 1 CHECK (show_form_description IN (0, 1));

UPDATE contact_forms
SET title = CASE WHEN json_valid(title) THEN title ELSE json_object('en', title) END,
	description = CASE
		WHEN json_valid(description) THEN description
		WHEN trim(description) = '' THEN ''
		ELSE json_object('en', description)
	END,
	form_title = CASE
		WHEN json_valid(form_title) THEN form_title
		WHEN trim(form_title) = '' THEN ''
		ELSE json_object('en', form_title)
	END,
	form_description = CASE
		WHEN json_valid(form_description) THEN form_description
		WHEN trim(form_description) = '' THEN ''
		ELSE json_object('en', form_description)
	END;
