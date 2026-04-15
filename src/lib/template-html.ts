const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export const DEFAULT_HEADER_TEMPLATE_HTML = `<header class="bg-white border-bottom shadow-sm">
  <div class="container-fluid px-3 px-lg-4">
    <nav class="navbar navbar-expand-lg py-2">
      <div class="container-fluid px-0">
        {{brand}}
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse w-100" id="mainNavbar">
          {{navigation}}
        </div>
      </div>
    </nav>
  </div>
</header>`;

export const DEFAULT_NAVIGATION_TEMPLATE_HTML = `<div class="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center w-100 gap-lg-3">
  <ul class="navbar-nav flex-grow-1 justify-content-lg-center mb-3 mb-lg-0 gap-lg-1">
    {{navItems}}
  </ul>
  <div class="d-flex align-items-center justify-content-lg-end mt-3 mt-lg-0 flex-shrink-0">
    {{languageSwitch}}
  </div>
</div>`;

export const DEFAULT_BLOG_FEED_TEMPLATE_HTML = `<section class="mb-5">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="h4 mb-0">{{heading}}</h2>
    <a class="btn btn-sm btn-outline-primary" href="{{viewAllHref}}">{{viewAllLabel}}</a>
  </div>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {{posts}}
  </div>
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
