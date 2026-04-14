UPDATE site_settings
SET page_template_html = CASE
	WHEN page_template_html IS NULL OR trim(page_template_html) = '' THEN '<section class="page-shell">{{content}}</section>'
	ELSE page_template_html
END
WHERE id = 1;
