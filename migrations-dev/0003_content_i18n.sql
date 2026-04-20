ALTER TABLE posts RENAME COLUMN content_markdown TO content;

UPDATE posts
SET
	title = CASE
		WHEN json_valid(title) THEN title
		ELSE json_object('en', title)
	END,
	content = CASE
		WHEN json_valid(content) THEN content
		ELSE json_object('en', content)
	END;

ALTER TABLE site_pages RENAME COLUMN content_markdown TO content;

UPDATE site_pages
SET
	title = CASE
		WHEN json_valid(title) THEN title
		ELSE json_object('en', title)
	END,
	content = CASE
		WHEN json_valid(content) THEN content
		ELSE json_object('en', content)
	END;
