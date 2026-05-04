import {
	DEFAULT_BLOG_FEED_TEMPLATE_HTML,
	DEFAULT_HEADER_TEMPLATE_HTML,
	DEFAULT_NAVIGATION_TEMPLATE_HTML,
} from "./template-html";

const DEFAULT_PAGE_TEMPLATE_HTML = `<section class="page-shell"><div class="page-shell__inner">{{content}}</div></section>`;

export interface SiteThemePreset {
	key: string;
	name: string;
	description: string;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	footerBackground: string;
	footerTextColor: string;
	headerTemplateHtml: string;
	navbarTemplateHtml: string;
	pageTemplateHtml: string;
	blogFeedTemplateHtml: string;
	footerTemplateHtml: string;
	preview: {
		surface: string;
		accent: string;
		text: string;
	};
}

export const DEFAULT_SITE_THEME_KEY = "classic";

export const SITE_THEME_PRESETS: SiteThemePreset[] = [
	{
		key: "classic",
		name: "Classic",
		description: "Clean and neutral. A safe default for company profiles and general CMS sites.",
		headerBackground: "#ffffff",
		headerTextColor: "#0f1219",
		headerAccentColor: "#1f2937",
		footerBackground: "#ffffff",
		footerTextColor: "#4b5563",
		headerTemplateHtml: DEFAULT_HEADER_TEMPLATE_HTML,
		navbarTemplateHtml: DEFAULT_NAVIGATION_TEMPLATE_HTML,
		pageTemplateHtml: DEFAULT_PAGE_TEMPLATE_HTML,
		blogFeedTemplateHtml: DEFAULT_BLOG_FEED_TEMPLATE_HTML,
		footerTemplateHtml: "",
		preview: {
			surface: "#ffffff",
			accent: "#1f2937",
			text: "#0f1219",
		},
	},
	{
		key: "editorial",
		name: "Editorial",
		description: "Airy layout with stronger content framing for blogs, magazines, and news-style sites.",
		headerBackground: "#f8f1e7",
		headerTextColor: "#26170f",
		headerAccentColor: "#9a3412",
		footerBackground: "#1f1814",
		footerTextColor: "#f3e9df",
		headerTemplateHtml: `<header class="site-navbar-shell py-2">
  <div class="container-fluid px-3 px-lg-4">
    <nav class="navbar navbar-expand-lg site-navbar-bar align-items-start flex-column gap-3">
      <div class="d-flex w-100 align-items-center justify-content-between gap-3 flex-wrap">
        {{brand}}
        <div class="d-flex align-items-center gap-2 ms-lg-auto">
          {{languageSwitch}}
        </div>
      </div>
      <button class="navbar-toggler site-navbar-toggle ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse w-100 border-top pt-3" id="mainNavbar">
        {{navigation}}
      </div>
    </nav>
  </div>
</header>`,
		navbarTemplateHtml: `<div class="site-nav-layout d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center w-100 gap-3">
  <ul class="navbar-nav site-nav-list flex-wrap flex-grow-1 mb-0 gap-lg-2">
    {{navItems}}
  </ul>
</div>`,
		pageTemplateHtml: `<section class="page-shell py-3 py-lg-4"><div class="page-shell__inner">{{content}}</div></section>`,
		blogFeedTemplateHtml: `<section class="blog-feed-section mb-5">
  <div class="blog-feed-heading mb-3">
    <p class="blog-feed-kicker mb-2">Latest stories</p>
    <h2 class="blog-feed-heading-title mb-0">{{heading}}</h2>
  </div>
  {{posts}}
</section>`,
		footerTemplateHtml: `<footer class="site-footer-fallback">
  <div class="site-footer-fallback__body">
    <div class="d-grid gap-2">
      <p class="site-footer-fallback__copy mb-0">{{footerText}}</p>
      <div class="site-social-links">{{socialLinks}}</div>
    </div>
    <p class="site-footer-fallback__meta mb-0">{{year}}</p>
  </div>
</footer>`,
		preview: {
			surface: "#f8f1e7",
			accent: "#9a3412",
			text: "#26170f",
		},
	},
	{
		key: "spotlight",
		name: "Spotlight",
		description: "Bolder contrast and stronger CTA energy for product launches, agencies, and campaign pages.",
		headerBackground: "#0f172a",
		headerTextColor: "#f8fafc",
		headerAccentColor: "#38bdf8",
		footerBackground: "#020617",
		footerTextColor: "#cbd5e1",
		headerTemplateHtml: `<header class="site-navbar-shell py-2 py-lg-3">
  <div class="container-fluid px-3 px-lg-4">
    <nav class="navbar navbar-expand-lg site-navbar-bar">
      <div class="container-fluid px-0 align-items-center gap-3">
        {{brand}}
        <div class="d-flex align-items-center gap-2 order-lg-3 ms-lg-auto">
          {{languageSwitch}}
        </div>
        <button class="navbar-toggler site-navbar-toggle order-lg-2" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse w-100 order-lg-2" id="mainNavbar">
          {{navigation}}
        </div>
      </div>
    </nav>
  </div>
</header>`,
		navbarTemplateHtml: `<div class="site-nav-layout d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center w-100 gap-lg-4">
  <ul class="navbar-nav site-nav-list flex-grow-1 justify-content-lg-end mb-3 mb-lg-0 gap-lg-2">
    {{navItems}}
  </ul>
</div>`,
		pageTemplateHtml: `<section class="page-shell py-2 py-lg-3"><div class="page-shell__inner">{{content}}</div></section>`,
		blogFeedTemplateHtml: `<section class="blog-feed-section mb-5">
  <div class="blog-feed-heading mb-3">
    <p class="blog-feed-kicker mb-2">Highlights</p>
    <h2 class="blog-feed-heading-title mb-0">{{heading}}</h2>
  </div>
  {{posts}}
</section>`,
		footerTemplateHtml: `<footer class="site-footer-fallback">
  <div class="site-footer-fallback__body">
    <p class="site-footer-fallback__copy mb-0">{{footerText}}</p>
    <div class="d-flex flex-wrap align-items-center gap-3">
      <div class="site-social-links">{{socialLinks}}</div>
      <p class="site-footer-fallback__meta mb-0">{{year}}</p>
    </div>
  </div>
</footer>`,
		preview: {
			surface: "#0f172a",
			accent: "#38bdf8",
			text: "#f8fafc",
		},
	},
];

export function getSiteThemePreset(themeKey?: string | null): SiteThemePreset {
	return SITE_THEME_PRESETS.find((theme) => theme.key === themeKey) ?? SITE_THEME_PRESETS[0];
}
