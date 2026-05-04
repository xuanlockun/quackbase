const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export const DEFAULT_HEADER_TEMPLATE_HTML = `<header class="site-navbar-shell">
  <div class="container-fluid px-3 px-lg-4">
    <nav class="navbar navbar-expand-lg site-navbar-bar">
      <div class="container-fluid px-0 align-items-center gap-3">
        {{brand}}
        <button class="navbar-toggler site-navbar-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse w-100 site-navbar-collapse" id="mainNavbar">
          {{navigation}}
        </div>
      </div>
    </nav>
  </div>
</header>`;

export const DEFAULT_NAVIGATION_TEMPLATE_HTML = `<div class="site-nav-layout d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center w-100 gap-lg-3">
  <ul class="navbar-nav site-nav-list flex-grow-1 justify-content-lg-center mb-3 mb-lg-0 gap-lg-1">
    {{navItems}}
  </ul>
  <div class="site-nav-actions d-flex align-items-center justify-content-lg-end mt-3 mt-lg-0 flex-shrink-0">
    {{languageSwitch}}
  </div>
</div>`;

export const DEFAULT_BLOG_FEED_TEMPLATE_HTML = `<section class="blog-feed-section mb-5">
  <div class="blog-feed-heading">
    <h2 class="blog-feed-heading-title mb-0">{{heading}}</h2>
  </div>
  {{posts}}
</section>`;

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function renderTemplateHtml(templateHtml: string, replacements: Record<string, string>): string {
	const source = templateHtml.trim();
	if (!source) {
		return "";
	}

	return source.replace(TEMPLATE_PLACEHOLDER_PATTERN, (match, key: string) => {
		return Object.prototype.hasOwnProperty.call(replacements, key) ? replacements[key] : match;
	});
}

export function renderBlogFeedTemplate(templateHtml: string, replacements: Record<string, string>): string {
	return renderTemplateHtml(templateHtml.trim() || DEFAULT_BLOG_FEED_TEMPLATE_HTML, replacements);
}
