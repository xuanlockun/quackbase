import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import {
	DEFAULT_LANGUAGE,
	type LocalizedText,
	getLocalizedPostPath,
	normalizeLocalizedText,
	resolveLanguage,
	resolveLocalizedValue,
	stringifyLocalizedText,
} from "./i18n";
import { FALLBACK_LANGUAGE_CATALOG, type LanguageCatalogState, loadLanguageCatalog } from "./languages";
import { DEFAULT_BLOG_FEED_TEMPLATE_HTML } from "./template-html";
import { normalizePayloadOrder } from "./ui-table-order";

function catalogOrFallback(catalog?: LanguageCatalogState): LanguageCatalogState {
	return catalog ?? FALLBACK_LANGUAGE_CATALOG;
}

export const DEFAULT_PAGE_TEMPLATE_HTML = `<section class="page-shell">{{content}}</section>`;

export interface BlogPostRecord {
	id: number;
	slug: string;
	title: string;
	description: string;
	content: string;
	hero_image: string | null;
	status: string;
	pub_date: string;
	updated_date: string;
}

export interface BlogPost {
	id: number;
	slug: string;
	slugTranslations: LocalizedText;
	title: string;
	titleTranslations: LocalizedText;
	description: string;
	descriptionTranslations: LocalizedText;
	content: string;
	contentTranslations: LocalizedText;
	contentHtml: string;
	heroImage?: string;
	status: string;
	pubDate: Date;
	updatedDate?: Date;
	requestedLanguage: string;
	resolvedLanguage: string;
}

export interface BlogPostInput {
	slugTranslations: LocalizedText;
	titleTranslations: LocalizedText;
	descriptionTranslations: LocalizedText;
	contentTranslations: LocalizedText;
	heroImage?: string;
	status: string;
	pubDate?: string;
}

export interface AdminPostSummary {
	id: number;
	title: string;
	titleTranslations: LocalizedText;
	description: string;
	descriptionTranslations: LocalizedText;
	slug: string;
	slugTranslations: LocalizedText;
	status: string;
	updatedAt: string;
	viewHref: string;
	editHref: string;
}

export interface AdminPostDetail extends AdminPostSummary {
	heroImage: string | null;
	pubDate: string;
	content: string;
	contentTranslations: LocalizedText;
	requestedLanguage: string;
	resolvedLanguage: string;
}

export interface SiteNavItem {
	label: string;
	labelTranslations: LocalizedText;
	href: string;
	sortOrder: number;
	children?: SiteNavItem[];
}

type SiteNavTreePayload = {
	label?: string;
	labelTranslations?: LocalizedText;
	href?: string;
	children?: SiteNavTreePayload[];
};

function normalizeNavTreePayload(
	payload: unknown,
	catalog: LanguageCatalogState,
): SiteNavItem[] {
	if (!Array.isArray(payload)) {
		return [];
	}

	return payload
		.map((node) => normalizeNavTreeNode(node, catalog))
		.filter((entry): entry is SiteNavItem => Boolean(entry));
}

function normalizeNavTreeNode(
	payload: unknown,
	catalog: LanguageCatalogState,
): SiteNavItem | null {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		return null;
	}

	const record = payload as Record<string, unknown>;
	const href = typeof record.href === "string" ? record.href.trim() : "";
	if (!href) {
		return null;
	}

	const rawLabelTranslations = record.labelTranslations;
	let labelSource: unknown = record.label ?? rawLabelTranslations;

	if (rawLabelTranslations && typeof rawLabelTranslations === "object" && !Array.isArray(rawLabelTranslations)) {
		const normalizedRawTranslations = { ...(rawLabelTranslations as Record<string, unknown>) };
		const defaultCode = catalog.defaultLanguageCode;
		if (
			typeof normalizedRawTranslations[defaultCode] !== "string" ||
			!String(normalizedRawTranslations[defaultCode]).trim()
		) {
			const fallbackTranslation = Object.values(normalizedRawTranslations).find(
				(value) => typeof value === "string" && value.trim(),
			);
			if (typeof fallbackTranslation === "string" && fallbackTranslation.trim()) {
				normalizedRawTranslations[defaultCode] = fallbackTranslation.trim();
			} else if (typeof record.label === "string" && record.label.trim()) {
				normalizedRawTranslations[defaultCode] = record.label.trim();
			}
		}
		labelSource = normalizedRawTranslations;
	}

	const labelTranslations = normalizeLocalizedText(labelSource, {
		fallbackValue: typeof record.label === "string" ? record.label : undefined,
		requireDefault: true,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});

	if (!labelTranslations) {
		return null;
	}

	const children = normalizeNavTreePayload(record.children ?? [], catalog);
	return {
		label: resolveLocalizedValue(labelTranslations, catalog.defaultLanguageCode, catalog),
		labelTranslations,
		href,
		sortOrder: 0,
		children: children.length ? children : undefined,
	};
}

function assignNavSortOrders(items: SiteNavItem[]): void {
	let nextOrder = 0;
	const walk = (nodes: SiteNavItem[]) => {
		for (const node of nodes) {
			node.sortOrder = nextOrder++;
			if (node.children?.length) {
				walk(node.children);
			}
		}
	};
	walk(items);
}

function flattenNavTree(items: SiteNavItem[]): SiteNavItem[] {
	const flattened: SiteNavItem[] = [];
	const walk = (nodes: SiteNavItem[]) => {
		for (const node of nodes) {
			const { children, ...base } = node;
			flattened.push({ ...base, children: undefined });
			if (children?.length) {
				walk(children);
			}
		}
	};
	walk(items);
	return flattened;
}

function serializeNavTree(items: SiteNavItem[]): SiteNavTreePayload[] {
	return items.map((node) => ({
		label: node.label,
		labelTranslations: node.labelTranslations,
		href: node.href,
		children: node.children?.length ? serializeNavTree(node.children) : undefined,
	}));
}

export interface SiteConfig {
	siteTitle: string;
	homePageSlug: string;
	faviconUrl: string;
	logoUrl: string;
	mediaStorageSettings: MediaStorageSettings;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	headerTemplateHtml: string;
	navbarTemplateHtml: string;
	pageTemplateHtml: string;
	blogFeedTemplateHtml: string;
	footerText: string;
	footerBackground: string;
	footerTextColor: string;
	footerTemplateHtml: string;
	navItems: SiteNavItem[];
}

export interface MediaStorageSettings {
	s3Endpoint: string;
	s3Bucket: string;
	s3PublicBaseUrl: string;
	s3AccessKeyId: string;
	s3SecretAccessKey: string;
	s3Region: string;
	s3ForcePathStyle: boolean;
}

export interface SitePageRecord {
	id: number;
	title: string;
	slug: string;
	description: string;
	content: string;
	show_title: number;
	show_posts_section: number;
	page_sections?: string | null;
	status: string;
	updated_at: string;
}

export interface SitePage {
	id: number;
	title: string;
	titleTranslations: LocalizedText;
	showTitle: boolean;
	slug: string;
	description: string;
	content: string;
	contentTranslations: LocalizedText;
	contentHtml: string;
	pageSections: PageSectionConfig[];
	status: string;
	updatedAt: Date;
	requestedLanguage: string;
	resolvedLanguage: string;
}

export type PageSectionType = "page_content" | "blog_feed" | "banner_slider" | "contact_form";

export interface PageSectionConfig {
	type: PageSectionType;
	order: number;
	bannerIds?: number[];
	bannerUrls?: string[];
	contactFormId?: number;
}

export interface SitePageInput {
	titleTranslations: LocalizedText;
	showTitle: boolean;
	slug: string;
	description: string;
	contentTranslations: LocalizedText;
	pageSections: PageSectionConfig[];
	status: string;
}

export function hasPageSection(
	pageSections: PageSectionConfig[],
	type: PageSectionType,
): boolean {
	return pageSections.some((section) => section.type === type);
}

export function getDb(locals: App.Locals): D1Database {
	const db = locals.runtime.env.DB;
	if (!db) {
		throw new Error("D1 binding `DB` is not configured.");
	}
	return db;
}

export function renderMarkdown(markdown: string): string {
	return renderStructuredMarkdown(markdown);
}

function renderStructuredMarkdown(markdown: string): string {
	const normalized = markdown.replace(/\r\n?/g, "\n");
	const lines = normalized.split("\n");
	const segments: string[] = [];
	const markdownBuffer: string[] = [];
	let inFence = false;

	const flushMarkdownBuffer = () => {
		if (markdownBuffer.length === 0) {
			return;
		}

		segments.push(renderMarkdownChunk(markdownBuffer.join("\n")));
		markdownBuffer.length = 0;
	};

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trim();

		if (isFenceLine(trimmed)) {
			inFence = !inFence;
			markdownBuffer.push(line);
			continue;
		}

		if (!inFence && isColumnsBlockStart(trimmed)) {
			const block = parseColumnsBlock(lines, index);
			if (block) {
				flushMarkdownBuffer();
				segments.push(block.html);
				index = block.nextIndex;
				continue;
			}
		}

		markdownBuffer.push(line);
	}

	flushMarkdownBuffer();
	return segments.join("");
}

function renderMarkdownChunk(markdown: string): string {
	if (!markdown.trim()) {
		return "";
	}

	return micromark(markdown, {
		allowDangerousHtml: false,
		extensions: [gfm()],
		htmlExtensions: [gfmHtml()],
	});
}

function isFenceLine(trimmedLine: string): boolean {
	return trimmedLine.startsWith("```") || trimmedLine.startsWith("~~~");
}

function isColumnsBlockStart(trimmedLine: string): boolean {
	return /^:::\s*columns(?:\s|$)/i.test(trimmedLine);
}

function isColumnBlockStart(trimmedLine: string): boolean {
	return /^:::\s*column(?:\s|$)/i.test(trimmedLine);
}

function isBlockClose(trimmedLine: string): boolean {
	return trimmedLine === ":::";
}

function parseColumnsBlock(
	lines: string[],
	startIndex: number,
): { html: string; nextIndex: number } | null {
	const columns: string[] = [];
	let currentColumn: string[] | null = null;
	let inFence = false;

	for (let index = startIndex + 1; index < lines.length; index += 1) {
		const line = lines[index];
		const trimmed = line.trim();

		if (isFenceLine(trimmed)) {
			inFence = !inFence;
			if (currentColumn) {
				currentColumn.push(line);
			}
			continue;
		}

		if (!inFence && isColumnBlockStart(trimmed)) {
			if (currentColumn) {
				return null;
			}

			currentColumn = [];
			continue;
		}

		if (!inFence && isBlockClose(trimmed)) {
			if (currentColumn) {
				columns.push(currentColumn.join("\n"));
				currentColumn = null;
				continue;
			}

			if (columns.length === 0) {
				return null;
			}

			return {
				html: renderColumnsBlock(columns),
				nextIndex: index,
			};
		}

		if (currentColumn) {
			currentColumn.push(line);
			continue;
		}

		if (trimmed.length === 0) {
			continue;
		}

		return null;
	}

	return null;
}

function renderColumnsBlock(columns: string[]): string {
	const columnCount = columns.length;
	const renderedColumns = columns
		.map((column) => `<div class="cms-column">${renderMarkdownChunk(column)}</div>`)
		.join("");

	return `<div class="cms-columns" style="--cms-columns-count: ${columnCount};" data-cms-columns-count="${columnCount}">${renderedColumns}</div>`;
}

export { getDefaultLanguage, getSupportedLanguages, getLocalizedPagePath, getLocalizedPostPath } from "./i18n";

export function toBlogPost(
	row: BlogPostRecord,
	requestedLanguage = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): BlogPost {
	const c = catalogOrFallback(catalog);
	const slugTranslations = normalizeLocalizedSlugMap(row.slug, {
		fallbackValue: row.slug,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const descriptionTranslations = normalizeLocalizedText(row.description, {
		fallbackValue: row.description,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const contentTranslations = normalizeLocalizedText(row.content, {
		fallbackValue: row.content,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const language = resolveLanguage(requestedLanguage, c);
	const slug = resolveLocalizedSlug(slugTranslations, language, c);
	const title = resolveLocalizedValue(titleTranslations, language, c);
	const description = resolveLocalizedValue(descriptionTranslations, language, c);
	const content = resolveLocalizedValue(contentTranslations, language, c);

	return {
		id: row.id,
		slug,
		slugTranslations,
		title,
		titleTranslations,
		description,
		descriptionTranslations,
		content,
		contentTranslations,
		contentHtml: renderMarkdown(content),
		heroImage: row.hero_image ?? undefined,
		status: row.status,
		pubDate: new Date(row.pub_date),
		updatedDate: row.updated_date ? new Date(row.updated_date) : undefined,
		requestedLanguage: language,
		resolvedLanguage:
			titleTranslations[language]?.trim() && contentTranslations[language]?.trim()
				? language
				: c.defaultLanguageCode,
	};
}

export async function listPublishedPosts(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BlogPost[]> {
	await ensurePostTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE status = 'published'
			ORDER BY datetime(pub_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map((row) => toBlogPost(row, language, c));
}

export async function getSiteConfig(db: D1Database): Promise<SiteConfig> {
	await ensureSiteTables(db);
	const catalog = await loadLanguageCatalog(db);

	const settings = await db
		.prepare(
			`SELECT site_title, home_page_slug, favicon_url, logo_url, media_s3_endpoint, media_s3_bucket, media_s3_public_base_url, media_s3_access_key_id, media_s3_secret_access_key, media_s3_region, media_s3_force_path_style, header_background, header_text_color, header_accent_color, header_template_html, navbar_template_html, page_template_html, blog_feed_template_html, nav_items
			FROM site_settings
			WHERE id = 1`,
		)
		.first<{
			site_title: string;
			home_page_slug: string;
			favicon_url: string;
			logo_url: string;
			media_s3_endpoint: string;
			media_s3_bucket: string;
			media_s3_public_base_url: string;
			media_s3_access_key_id: string;
			media_s3_secret_access_key: string;
			media_s3_region: string;
			media_s3_force_path_style: string;
			header_background: string;
			header_text_color: string;
			header_accent_color: string;
			header_template_html: string;
			navbar_template_html: string;
			page_template_html: string;
			blog_feed_template_html: string;
			nav_items: string | null;
		}>();

	const footerSettings = await db
		.prepare(
			`SELECT footer_text, footer_background, footer_text_color, footer_template_html
			FROM footer_settings
			WHERE id = 1`,
		)
		.first<{
			footer_text: string;
			footer_background: string;
			footer_text_color: string;
			footer_template_html: string;
		}>();

	const navResult = await db
		.prepare(
			`SELECT label, href, sort_order
			FROM navigation_items
			WHERE is_visible = 1
			ORDER BY sort_order ASC, id ASC`,
		)
		.all<{ label: string; href: string; sort_order: number }>();

	let navItems: SiteNavItem[] = [];
	if (settings?.nav_items) {
		try {
			const parsedNav = JSON.parse(settings.nav_items);
			navItems = normalizeNavTreePayload(parsedNav, catalog);
		} catch {
			navItems = [];
		}
	}

	if (!navItems.length) {
		navItems = (navResult.results ?? []).map((item) => {
			const labelTranslations = normalizeLocalizedText(item.label, {
				fallbackValue: item.label,
				defaultLanguageCode: catalog.defaultLanguageCode,
			});
			return {
				label: resolveLocalizedValue(labelTranslations, catalog.defaultLanguageCode, catalog),
				labelTranslations,
				href: item.href,
				sortOrder: item.sort_order,
			};
		});
	}

	assignNavSortOrders(navItems);

	return {
		siteTitle: settings?.site_title ?? "Edge CMS",
		homePageSlug: settings?.home_page_slug ?? "home",
		faviconUrl: settings?.favicon_url ?? "/favicon.svg",
		logoUrl: settings?.logo_url ?? "",
		mediaStorageSettings: {
			s3Endpoint: settings?.media_s3_endpoint ?? "",
			s3Bucket: settings?.media_s3_bucket ?? "",
			s3PublicBaseUrl: settings?.media_s3_public_base_url ?? "",
			s3AccessKeyId: settings?.media_s3_access_key_id ?? "",
			s3SecretAccessKey: settings?.media_s3_secret_access_key ?? "",
			s3Region: settings?.media_s3_region ?? "auto",
			s3ForcePathStyle: parseBooleanSetting(settings?.media_s3_force_path_style, true),
		},
		headerBackground: settings?.header_background ?? "#ffffff",
		headerTextColor: settings?.header_text_color ?? "#0f1219",
		headerAccentColor: settings?.header_accent_color ?? "#2337ff",
		headerTemplateHtml: settings?.header_template_html ?? "",
		navbarTemplateHtml: settings?.navbar_template_html ?? "",
		pageTemplateHtml: settings?.page_template_html?.trim() ? settings.page_template_html : DEFAULT_PAGE_TEMPLATE_HTML,
		blogFeedTemplateHtml: settings?.blog_feed_template_html?.trim()
			? settings.blog_feed_template_html
			: DEFAULT_BLOG_FEED_TEMPLATE_HTML,
		footerText: footerSettings?.footer_text ?? "Edge CMS. Content updates go live straight from D1.",
		footerBackground: footerSettings?.footer_background ?? "#eef2f7",
		footerTextColor: footerSettings?.footer_text_color ?? "#60739f",
		footerTemplateHtml: footerSettings?.footer_template_html ?? "",
		navItems,
	};
}

export async function saveSiteConfig(
	db: D1Database,
	input: {
		siteTitle: string;
		homePageSlug: string;
		faviconUrl: string;
		logoUrl: string;
		headerBackground: string;
		headerTextColor: string;
		headerAccentColor: string;
		footerBackground: string;
		footerTextColor: string;
		navItems: SiteNavItem[];
	},
): Promise<void> {
	await ensureSiteTables(db);
	const catalog = await loadLanguageCatalog(db);
	const navTree = input.navItems ?? [];
	assignNavSortOrders(navTree);
	const navPayload = JSON.stringify(serializeNavTree(navTree));
	const flatNavItems = flattenNavTree(navTree);

	const statements = [
		db
			.prepare(
				`INSERT INTO site_settings (id, site_title, home_page_slug, favicon_url, logo_url, header_background, header_text_color, header_accent_color, nav_items, updated_at)
				VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					site_title = excluded.site_title,
					home_page_slug = excluded.home_page_slug,
					favicon_url = excluded.favicon_url,
					logo_url = excluded.logo_url,
					header_background = excluded.header_background,
					header_text_color = excluded.header_text_color,
					header_accent_color = excluded.header_accent_color,
					nav_items = excluded.nav_items,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(
				input.siteTitle.trim(),
				normalizeHomePageSlug(input.homePageSlug),
				normalizeFaviconUrl(input.faviconUrl),
				normalizeLogoUrl(input.logoUrl),
				sanitizeHexColor(input.headerBackground, "#ffffff"),
				sanitizeHexColor(input.headerTextColor, "#0f1219"),
				sanitizeHexColor(input.headerAccentColor, "#2337ff"),
				navPayload,
			),
		db
			.prepare(
				`INSERT INTO footer_settings (id, footer_background, footer_text_color, updated_at)
				VALUES (1, ?1, ?2, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					footer_background = excluded.footer_background,
					footer_text_color = excluded.footer_text_color,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(
				sanitizeHexColor(input.footerBackground, "#eef2f7"),
				sanitizeHexColor(input.footerTextColor, "#60739f"),
			),
		db.prepare(`DELETE FROM navigation_items`),
		...flatNavItems.map((item) =>
			db
				.prepare(
					`INSERT INTO navigation_items (label, href, sort_order, is_visible)
					VALUES (?1, ?2, ?3, 1)`,
				)
				.bind(stringifyLocalizedText(item.labelTranslations, catalog), normalizeHref(item.href), item.sortOrder),
		),
	];

	await db.batch(statements);
}

export async function saveSiteSettings(
	db: D1Database,
	input: {
		siteTitle: string;
		faviconUrl: string;
		logoUrl: string;
	},
): Promise<void> {
	await ensureSiteTables(db);

	await db
		.prepare(
			`INSERT INTO site_settings (id, site_title, favicon_url, logo_url, updated_at)
			VALUES (1, ?1, ?2, ?3, CURRENT_TIMESTAMP)
			ON CONFLICT(id) DO UPDATE SET
				site_title = excluded.site_title,
				favicon_url = excluded.favicon_url,
				logo_url = excluded.logo_url,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(
			input.siteTitle.trim(),
			normalizeFaviconUrl(input.faviconUrl),
			normalizeLogoUrl(input.logoUrl),
		)
		.run();
}

export async function getMediaStorageSettings(db: D1Database): Promise<MediaStorageSettings> {
	await ensureSiteTables(db);
	const settings = await db
		.prepare(
			`SELECT media_s3_endpoint, media_s3_bucket, media_s3_public_base_url,
				media_s3_access_key_id, media_s3_secret_access_key, media_s3_region, media_s3_force_path_style
			FROM site_settings
			WHERE id = 1`,
		)
		.first<{
			media_s3_endpoint: string;
			media_s3_bucket: string;
			media_s3_public_base_url: string;
			media_s3_access_key_id: string;
			media_s3_secret_access_key: string;
			media_s3_region: string;
			media_s3_force_path_style: string;
		}>();

	return {
		s3Endpoint: normalizeStorageUrl(settings?.media_s3_endpoint ?? ""),
		s3Bucket: settings?.media_s3_bucket?.trim() ?? "",
		s3PublicBaseUrl: normalizeStorageUrl(settings?.media_s3_public_base_url ?? ""),
		s3AccessKeyId: settings?.media_s3_access_key_id?.trim() ?? "",
		s3SecretAccessKey: settings?.media_s3_secret_access_key?.trim() ?? "",
		s3Region: settings?.media_s3_region?.trim() || "auto",
		s3ForcePathStyle: parseBooleanSetting(settings?.media_s3_force_path_style, true),
	};
}

export async function saveMediaStorageSettings(
	db: D1Database,
	input: MediaStorageSettings,
): Promise<void> {
	await ensureSiteTables(db);
	validateMediaStorageSettings(input);

	await db
		.prepare(
			`INSERT INTO site_settings (id, media_s3_endpoint, media_s3_bucket, media_s3_public_base_url, media_s3_access_key_id, media_s3_secret_access_key, media_s3_region, media_s3_force_path_style, updated_at)
			VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)
			ON CONFLICT(id) DO UPDATE SET
				media_s3_endpoint = excluded.media_s3_endpoint,
				media_s3_bucket = excluded.media_s3_bucket,
				media_s3_public_base_url = excluded.media_s3_public_base_url,
				media_s3_access_key_id = excluded.media_s3_access_key_id,
				media_s3_secret_access_key = excluded.media_s3_secret_access_key,
				media_s3_region = excluded.media_s3_region,
				media_s3_force_path_style = excluded.media_s3_force_path_style,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(
			normalizeStorageUrl(input.s3Endpoint),
			input.s3Bucket.trim(),
			normalizeStorageUrl(input.s3PublicBaseUrl),
			input.s3AccessKeyId.trim(),
			input.s3SecretAccessKey.trim(),
			input.s3Region.trim() || "auto",
			input.s3ForcePathStyle ? "1" : "0",
		)
		.run();
}

function validateMediaStorageSettings(input: MediaStorageSettings): void {
	const endpoint = normalizeStorageUrl(input.s3Endpoint);
	if (!endpoint) {
		throw new Error("S3 upload endpoint is required.");
	}

	let hostname = "";
	try {
		hostname = new URL(endpoint).hostname.toLowerCase();
	} catch {
		throw new Error("S3 upload endpoint must be a valid URL.");
	}

	if (hostname.endsWith(".r2.dev")) {
		throw new Error(
			"S3 upload endpoint cannot be the public r2.dev URL. Use the R2 account endpoint for uploads and put the r2.dev URL in Public base URL.",
		);
	}

	if (!input.s3Bucket.trim()) {
		throw new Error("S3 bucket name is required.");
	}
	if (!input.s3AccessKeyId.trim()) {
		throw new Error("S3 access key ID is required.");
	}
	if (!input.s3SecretAccessKey.trim()) {
		throw new Error("S3 secret access key is required.");
	}
}

export async function listAllPages(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<SitePage[]> {
	await ensureSiteTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_title, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map((row) => toSitePage(row, language, c));
}

export async function listPublishedPages(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<SitePage[]> {
	await ensureSiteTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_title, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			WHERE status = 'published'
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map((row) => toSitePage(row, language, c));
}

export async function getPageById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<SitePage | null> {
	await ensureSiteTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_title, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<SitePageRecord>();

	return result ? toSitePage(result, language, c) : null;
}

export async function getPublishedPageBySlug(
	db: D1Database,
	slug: string,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<SitePage | null> {
	await ensureSiteTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_title, show_posts_section, status, updated_at
			, page_sections
			FROM site_pages
			WHERE slug = ?1 AND status = 'published'
			LIMIT 1`,
		)
		.bind(slug)
		.first<SitePageRecord>();

	return result ? toSitePage(result, language, c) : null;
}

export async function createPage(db: D1Database, input: SitePageInput): Promise<number> {
	await ensureSiteTables(db);
	const catalog = await loadLanguageCatalog(db);

	const result = await db
		.prepare(
			`INSERT INTO site_pages (title, slug, description, content, show_title, show_posts_section, status, updated_at, page_sections)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP, ?8)`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations, catalog),
			input.slug,
			input.description,
			stringifyLocalizedText(input.contentTranslations, catalog),
			input.showTitle ? 1 : 0,
			input.pageSections.some((section) => section.type === "blog_feed") ? 1 : 0,
			input.status,
			JSON.stringify(input.pageSections),
		)
		.run();

	return Number(result.meta.last_row_id ?? 0);
}

export async function updatePage(
	db: D1Database,
	id: number,
	input: SitePageInput,
): Promise<void> {
	await ensureSiteTables(db);
	const catalog = await loadLanguageCatalog(db);

	await db
		.prepare(
			`UPDATE site_pages
			SET title = ?1,
				slug = ?2,
				description = ?3,
				content = ?4,
				show_title = ?5,
				show_posts_section = ?6,
				status = ?7,
				updated_at = CURRENT_TIMESTAMP,
				page_sections = ?8
			WHERE id = ?9`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations, catalog),
			input.slug,
			input.description,
			stringifyLocalizedText(input.contentTranslations, catalog),
			input.showTitle ? 1 : 0,
			input.pageSections.some((section) => section.type === "blog_feed") ? 1 : 0,
			input.status,
			JSON.stringify(input.pageSections),
			id,
		)
		.run();
}

export async function deletePage(db: D1Database, id: number): Promise<void> {
	await ensureSiteTables(db);
	await db.prepare("DELETE FROM site_pages WHERE id = ?1").bind(id).run();
}

export async function listAllPosts(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BlogPost[]> {
	await ensurePostTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			ORDER BY datetime(updated_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map((row) => toBlogPost(row, language, c));
}

export async function getPostById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BlogPost | null> {
	await ensurePostTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<BlogPostRecord>();

	return result ? toBlogPost(result, language, c) : null;
}

export function toAdminPostSummary(
	post: BlogPost,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): AdminPostSummary {
	const c = catalogOrFallback(catalog);
	return {
		id: post.id,
		title: resolveLocalizedValue(post.titleTranslations, language, c),
		titleTranslations: post.titleTranslations,
		description: resolveLocalizedValue(post.descriptionTranslations, language, c),
		descriptionTranslations: post.descriptionTranslations,
		slug: resolveLocalizedSlug(post.slugTranslations, language, c),
		slugTranslations: post.slugTranslations,
		status: post.status,
		updatedAt: (post.updatedDate ?? post.pubDate).toISOString(),
		viewHref: getLocalizedPostPath(post.slugTranslations, language, c),
		editHref: `/admin/posts/${post.id}/edit`,
	};
}

export function toAdminPostDetail(
	post: BlogPost,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): AdminPostDetail {
	const c = catalogOrFallback(catalog);
	return {
		...toAdminPostSummary(post, language, c),
		heroImage: post.heroImage ?? null,
		pubDate: post.pubDate.toISOString(),
		content: resolveLocalizedValue(post.contentTranslations, language, c),
		contentTranslations: post.contentTranslations,
		requestedLanguage: resolveLanguage(language, c),
		resolvedLanguage: post.resolvedLanguage,
	};
}

export async function getPublishedPostBySlug(
	db: D1Database,
	slug: string,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BlogPost | null> {
	await ensurePostTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));

	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE status = 'published'
			ORDER BY datetime(pub_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	const matchedRow = findPublishedPostRecordBySlug(result.results ?? [], slug, language, c);
	return matchedRow ? toBlogPost(matchedRow, language, c) : null;
}

export async function createPost(db: D1Database, input: BlogPostInput): Promise<number> {
	await ensurePostTables(db);
	const catalog = await loadLanguageCatalog(db);
	if (input.status === "published") {
		await assertPublishedPostSlugUniqueness(db, input.slugTranslations, catalog);
	}

	const result = await db
		.prepare(
			`INSERT INTO posts (slug, title, description, content, hero_image, status, pub_date, updated_date)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`,
		)
		.bind(
			stringifyLocalizedText(input.slugTranslations, catalog),
			stringifyLocalizedText(input.titleTranslations, catalog),
			stringifyLocalizedText(input.descriptionTranslations, catalog),
			stringifyLocalizedText(input.contentTranslations, catalog),
			normalizeOptionalString(input.heroImage),
			input.status,
			normalizePubDate(input.pubDate),
		)
		.run();

	return Number(result.meta.last_row_id ?? 0);
}

export async function updatePost(
	db: D1Database,
	id: number,
	input: BlogPostInput,
): Promise<void> {
	await ensurePostTables(db);
	const catalog = await loadLanguageCatalog(db);
	if (input.status === "published") {
		await assertPublishedPostSlugUniqueness(db, input.slugTranslations, catalog, id);
	}

	await db
		.prepare(
			`UPDATE posts
			SET slug = ?1,
				title = ?2,
				description = ?3,
				content = ?4,
				hero_image = ?5,
				status = ?6,
				pub_date = ?7,
				updated_date = CURRENT_TIMESTAMP
			WHERE id = ?8`,
		)
		.bind(
			stringifyLocalizedText(input.slugTranslations, catalog),
			stringifyLocalizedText(input.titleTranslations, catalog),
			stringifyLocalizedText(input.descriptionTranslations, catalog),
			stringifyLocalizedText(input.contentTranslations, catalog),
			normalizeOptionalString(input.heroImage),
			input.status,
			normalizePubDate(input.pubDate),
			id,
		)
		.run();
}

export async function deletePost(db: D1Database, id: number): Promise<void> {
	await ensurePostTables(db);

	await db.prepare("DELETE FROM posts WHERE id = ?1").bind(id).run();
}

export function parsePostForm(formData: FormData, defaultLanguageCode?: string): BlogPostInput {
	const def = defaultLanguageCode ?? DEFAULT_LANGUAGE;
	return {
		slugTranslations: parseLocalizedSlugFieldFromForm(formData, "slug", "slug", def),
		titleTranslations: parseLocalizedFieldFromForm(formData, "title", "title_en", def),
		descriptionTranslations: parseLocalizedFieldFromForm(formData, "description", "description", def),
		contentTranslations: parseLocalizedFieldFromForm(formData, "content", "content_en", def),
		heroImage: optionalString(formData, "heroImage") || undefined,
		status: normalizeStatus(requiredString(formData, "status")),
		pubDate: optionalString(formData, "pubDate") || undefined,
	};
}

export function parsePostPayload(payload: unknown, defaultLanguageCode?: string): BlogPostInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid post payload.");
	}

	const def = defaultLanguageCode ?? DEFAULT_LANGUAGE;
	return {
		slugTranslations: parseLocalizedSlugFieldValue((payload as Record<string, unknown>).slug, "slug", def),
		titleTranslations: parseLocalizedFieldValue((payload as Record<string, unknown>).title, "title", def),
		descriptionTranslations: parseLocalizedFieldValue((payload as Record<string, unknown>).description, "description", def),
		contentTranslations: parseLocalizedFieldValue((payload as Record<string, unknown>).content, "content", def),
		heroImage: optionalPayloadString(payload, "heroImage") || undefined,
		status: normalizeStatus(requiredPayloadString(payload, "status")),
		pubDate: optionalPayloadString(payload, "pubDate") || undefined,
	};
}

export function parseSiteSettingsForm(formData: FormData): {
	siteTitle: string;
	faviconUrl: string;
	logoUrl: string;
} {
	const siteTitle = optionalString(formData, "siteTitle") || "";
	const faviconUrl = optionalString(formData, "faviconUrl") || "/favicon.svg";
	const logoUrl = optionalString(formData, "logoUrl");

	return {
		siteTitle,
		faviconUrl,
		logoUrl,
	};
}

export function parseMediaStorageSettingsForm(formData: FormData): MediaStorageSettings {
	return {
		s3Endpoint: optionalString(formData, "s3Endpoint"),
		s3Bucket: optionalString(formData, "s3Bucket"),
		s3PublicBaseUrl: optionalString(formData, "s3PublicBaseUrl"),
		s3AccessKeyId: optionalString(formData, "s3AccessKeyId"),
		s3SecretAccessKey: optionalString(formData, "s3SecretAccessKey"),
		s3Region: optionalString(formData, "s3Region") || "auto",
		s3ForcePathStyle: isTruthyFormValue(formData.get("s3ForcePathStyle")),
	};
}

export function parseSiteForm(formData: FormData): {
	siteTitle: string;
	homePageSlug: string;
	faviconUrl: string;
	logoUrl: string;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	footerBackground: string;
	footerTextColor: string;
	navItems: SiteNavItem[];
} {
	const siteTitle = optionalString(formData, "siteTitle") || "";
	const homePageSlug = requiredString(formData, "homePageSlug");
	const faviconUrl = optionalString(formData, "faviconUrl") || "/favicon.svg";
	const logoUrl = optionalString(formData, "logoUrl");
	const headerBackground = optionalString(formData, "headerBackground") || "#ffffff";
	const headerTextColor = optionalString(formData, "headerTextColor") || "#0f1219";
	const headerAccentColor = optionalString(formData, "headerAccentColor") || "#2337ff";
	const footerBackground = optionalString(formData, "footerBackground") || "#eef2f7";
	const footerTextColor = optionalString(formData, "footerTextColor") || "#60739f";
	const navRaw = optionalString(formData, "navItems");
	let navItems: SiteNavItem[] = [];
	const catalog = catalogOrFallback();
	if (navRaw) {
		let parsed: unknown;
		try {
			parsed = JSON.parse(navRaw);
		} catch {
			parsed = null;
		}

		if (Array.isArray(parsed)) {
			navItems = normalizeNavTreePayload(parsed, catalog);
		} else {
			navItems = navRaw
				.split(/\r?\n/)
				.map((line) => line.trim())
				.filter(Boolean)
				.map((line, index) => {
					const [labelPart, hrefPart] = line.split("|");
					const label = labelPart?.trim();
					const href = hrefPart?.trim();
					if (!label || !href) {
						throw new Error("Navigation items must use the format Label|/path");
					}
					const labelTranslations = normalizeLocalizedText({ en: label }, { requireDefault: true });
					return {
						label,
						labelTranslations,
						href,
						sortOrder: index,
					};
				});
		}
	}

	assignNavSortOrders(navItems);

	return {
		siteTitle,
		homePageSlug,
		faviconUrl,
		logoUrl,
		headerBackground,
		headerTextColor,
		headerAccentColor,
		footerBackground,
		footerTextColor,
		navItems,
	};
}

export function parsePageForm(formData: FormData, defaultLanguageCode?: string): SitePageInput {
	const pageSections = parsePageSectionsForm(formData);
	const def = defaultLanguageCode ?? DEFAULT_LANGUAGE;

	return {
		titleTranslations: parseLocalizedFieldFromForm(formData, "title", "title_en", def),
		showTitle: formData.get("showTitle") === "1",
		slug: slugify(requiredString(formData, "slug")),
		description: requiredString(formData, "description"),
		contentTranslations: parseLocalizedFieldFromForm(formData, "content", "content_en", def),
		pageSections,
		status: normalizeStatus(requiredString(formData, "status")),
	};
}

export function parsePagePayload(payload: unknown, defaultLanguageCode?: string): SitePageInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid page payload.");
	}

	const record = payload as Record<string, unknown>;
	const pageSections: PageSectionConfig[] = Array.isArray(record.pageSections)
		? normalizePageSections(record.pageSections)
		: [{ type: "page_content", order: 1 }];

	const def = defaultLanguageCode ?? DEFAULT_LANGUAGE;
	return {
		titleTranslations: parseLocalizedFieldValue(record.title, "title", def),
		showTitle:
			record.showTitle === undefined
				? true
				: record.showTitle === true ||
					record.showTitle === 1 ||
					record.showTitle === "1" ||
					record.showTitle === "true",
		slug: slugify(requiredPayloadString(payload, "slug")),
		description: requiredPayloadString(payload, "description"),
		contentTranslations: parseLocalizedFieldValue(record.content, "content", def),
		pageSections,
		status: normalizeStatus(requiredPayloadString(payload, "status")),
	};
}

export function requiredString(formData: FormData, key: string): string {
	const value = formData.get(key);
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`Missing field: ${key}`);
	}
	return value.trim();
}

export function optionalString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

export function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function normalizeStatus(value: string): string {
	return value === "draft" ? "draft" : "published";
}

function normalizeOptionalString(value?: string): string | null {
	return value && value.trim() !== "" ? value.trim() : null;
}

function normalizePubDate(value?: string): string {
	if (!value) {
		return new Date().toISOString();
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.valueOf())) {
		return new Date().toISOString();
	}

	return parsed.toISOString();
}

export function normalizeLocalizedSlugMap(
	input: unknown,
	options?: {
		fallbackValue?: string;
		requireDefault?: boolean;
		defaultLanguageCode?: string;
	},
): LocalizedText {
	const defaultCode = options?.defaultLanguageCode ?? DEFAULT_LANGUAGE;
	const translations = normalizeLocalizedText(input, {
		...options,
		defaultLanguageCode: defaultCode,
	});
	const normalizedEntries = Object.entries(translations)
		.map(([code, value]) => [code, slugify(value)] as const)
		.filter(([, value]) => value);

	const normalized = Object.fromEntries(normalizedEntries) as LocalizedText;
	if (options?.requireDefault !== false && !normalized[defaultCode]) {
		throw new Error(`Missing ${defaultCode} translation.`);
	}
	return normalized;
}

export function resolveLocalizedSlug(
	slugTranslations: LocalizedText,
	requestedLanguage = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): string {
	return resolveLocalizedValue(slugTranslations, requestedLanguage, catalogOrFallback(catalog));
}

export function findPublishedPostRecordBySlug(
	rows: BlogPostRecord[],
	slug: string,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): BlogPostRecord | null {
	const c = catalogOrFallback(catalog);
	const requestedSlug = slugify(slug);
	const requestedLanguage = resolveLanguage(language, c);
	const defaultCode = c.defaultLanguageCode;

	for (const row of rows) {
		const slugTranslations = normalizeLocalizedSlugMap(row.slug, {
			fallbackValue: row.slug,
			defaultLanguageCode: defaultCode,
		});
		const localizedSlug = slugTranslations[requestedLanguage]?.trim();
		if (localizedSlug && localizedSlug === requestedSlug) {
			return row;
		}
	}

	for (const row of rows) {
		const slugTranslations = normalizeLocalizedSlugMap(row.slug, {
			fallbackValue: row.slug,
			defaultLanguageCode: defaultCode,
		});
		const localizedSlug = slugTranslations[requestedLanguage]?.trim();
		const defaultSlug = slugTranslations[defaultCode]?.trim();
		if (!localizedSlug && defaultSlug && defaultSlug === requestedSlug) {
			return row;
		}
	}

	return null;
}

async function assertPublishedPostSlugUniqueness(
	db: D1Database,
	slugTranslations: LocalizedText,
	catalog: LanguageCatalogState,
	excludePostId?: number,
): Promise<void> {
	const defaultCode = catalog.defaultLanguageCode;
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE status = 'published'`,
		)
		.all<BlogPostRecord>();

	for (const row of result.results ?? []) {
		if (excludePostId && row.id === excludePostId) {
			continue;
		}

		const existingTranslations = normalizeLocalizedSlugMap(row.slug, {
			fallbackValue: row.slug,
			defaultLanguageCode: defaultCode,
		});

		for (const [languageCode, slugValue] of Object.entries(slugTranslations)) {
			if (existingTranslations[languageCode] === slugValue) {
				throw new Error(`Duplicate published slug for language: ${languageCode}`);
			}
		}
	}
}

async function ensureSiteTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
				`CREATE TABLE IF NOT EXISTS site_settings (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				site_title TEXT NOT NULL DEFAULT 'Edge CMS',
				home_page_slug TEXT NOT NULL DEFAULT 'home',
				favicon_url TEXT NOT NULL DEFAULT '/favicon.svg',
				logo_url TEXT NOT NULL DEFAULT '',
				media_s3_endpoint TEXT NOT NULL DEFAULT '',
				media_s3_bucket TEXT NOT NULL DEFAULT '',
				media_s3_public_base_url TEXT NOT NULL DEFAULT '',
				media_s3_access_key_id TEXT NOT NULL DEFAULT '',
				media_s3_secret_access_key TEXT NOT NULL DEFAULT '',
				media_s3_region TEXT NOT NULL DEFAULT 'auto',
				media_s3_force_path_style TEXT NOT NULL DEFAULT '1',
				header_background TEXT NOT NULL DEFAULT '#ffffff',
				header_text_color TEXT NOT NULL DEFAULT '#0f1219',
				header_accent_color TEXT NOT NULL DEFAULT '#2337ff',
				header_template_html TEXT NOT NULL DEFAULT '',
				navbar_template_html TEXT NOT NULL DEFAULT '',
				page_template_html TEXT NOT NULL DEFAULT '',
				blog_feed_template_html TEXT NOT NULL DEFAULT '',
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS navigation_items (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				label TEXT NOT NULL,
				href TEXT NOT NULL,
				sort_order INTEGER NOT NULL DEFAULT 0,
				is_visible INTEGER NOT NULL DEFAULT 1
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS site_pages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				description TEXT NOT NULL,
				content TEXT NOT NULL,
				show_title INTEGER NOT NULL DEFAULT 1,
				show_posts_section INTEGER NOT NULL DEFAULT 0,
				page_sections TEXT NOT NULL DEFAULT '[]',
				status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS footer_settings (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				footer_text TEXT NOT NULL DEFAULT 'Edge CMS. Content updates go live straight from D1.',
				footer_background TEXT NOT NULL DEFAULT '#eef2f7',
				footer_text_color TEXT NOT NULL DEFAULT '#60739f',
				footer_template_html TEXT NOT NULL DEFAULT '',
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
	]);

	const pageColumns = await db.prepare(`PRAGMA table_info(site_pages)`).all<{ name: string }>();
	const columnNames = new Set((pageColumns.results ?? []).map((column) => column.name));
	const settingsColumns = await db.prepare(`PRAGMA table_info(site_settings)`).all<{ name: string }>();
	const settingsColumnNames = new Set((settingsColumns.results ?? []).map((column) => column.name));
	const footerColumns = await db.prepare(`PRAGMA table_info(footer_settings)`).all<{ name: string }>();
	const footerColumnNames = new Set((footerColumns.results ?? []).map((column) => column.name));

	if (!settingsColumnNames.has("nav_items")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN nav_items TEXT NOT NULL DEFAULT '[]'`).run();
	}

	if (!settingsColumnNames.has("favicon_url")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN favicon_url TEXT NOT NULL DEFAULT '/favicon.svg'`).run();
	}

	if (!settingsColumnNames.has("logo_url")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN logo_url TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_endpoint")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_endpoint TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_bucket")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_bucket TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_public_base_url")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_public_base_url TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_access_key_id")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_access_key_id TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_secret_access_key")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_secret_access_key TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("media_s3_region")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_region TEXT NOT NULL DEFAULT 'auto'`).run();
	}

	if (!settingsColumnNames.has("media_s3_force_path_style")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN media_s3_force_path_style TEXT NOT NULL DEFAULT '1'`).run();
	}

	if (!settingsColumnNames.has("header_template_html")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN header_template_html TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("navbar_template_html")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN navbar_template_html TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("page_template_html")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN page_template_html TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!settingsColumnNames.has("blog_feed_template_html")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN blog_feed_template_html TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!footerColumnNames.has("footer_template_html")) {
		await db.prepare(`ALTER TABLE footer_settings ADD COLUMN footer_template_html TEXT NOT NULL DEFAULT ''`).run();
	}

	if (!columnNames.has("page_sections")) {
		await db.prepare(`ALTER TABLE site_pages ADD COLUMN page_sections TEXT NOT NULL DEFAULT '[]'`).run();
		await db
			.prepare(
				`UPDATE site_pages
				SET page_sections = CASE
					WHEN show_posts_section = 1 THEN '["blog_feed"]'
					ELSE '[]'
				END`,
			)
			.run();
	}

	if (!columnNames.has("content") && columnNames.has("content_markdown")) {
		await db.prepare(`ALTER TABLE site_pages RENAME COLUMN content_markdown TO content`).run();
	}

	if (!columnNames.has("show_title")) {
		await db.prepare(`ALTER TABLE site_pages ADD COLUMN show_title INTEGER NOT NULL DEFAULT 1`).run();
	}

	await db
		.prepare(
			`UPDATE site_pages
			SET title = CASE
				WHEN json_valid(title) THEN title
				ELSE json_object('en', title)
			END,
			content = CASE
				WHEN json_valid(content) THEN content
				ELSE json_object('en', content)
			END`,
		)
		.run();

	if (!settingsColumnNames.has("home_page_slug")) {
		await db.prepare(`ALTER TABLE site_settings ADD COLUMN home_page_slug TEXT NOT NULL DEFAULT 'home'`).run();
	}

	await db.batch([
		db.prepare(
			`INSERT INTO site_settings (id, site_title, home_page_slug, favicon_url, logo_url, header_background, header_text_color, header_accent_color, header_template_html, navbar_template_html, page_template_html, blog_feed_template_html)
			VALUES (1, 'Edge CMS', 'home', '/favicon.svg', '', '#ffffff', '#0f1219', '#2337ff', '', '', '${DEFAULT_PAGE_TEMPLATE_HTML.replace(/'/g, "''")}', '${DEFAULT_BLOG_FEED_TEMPLATE_HTML.replace(/'/g, "''")}')
			ON CONFLICT(id) DO NOTHING`,
		),
		db.prepare(
			`INSERT INTO footer_settings (id, footer_text, footer_background, footer_text_color, footer_template_html)
			VALUES (1, 'Edge CMS. Content updates go live straight from D1.', '#eef2f7', '#60739f', '')
			ON CONFLICT(id) DO NOTHING`,
		),
		db.prepare(
			`INSERT INTO navigation_items (label, href, sort_order, is_visible)
			SELECT json_object('en', 'Home', 'vi', 'Trang chu'), '/', 0, 1
			WHERE NOT EXISTS (SELECT 1 FROM navigation_items)`,
		),
	]);

	await db
		.prepare(
			`UPDATE navigation_items
			SET label = CASE
				WHEN json_valid(label) THEN label
				ELSE json_object('en', label)
			END`,
		)
		.run();
}

async function ensurePostTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS posts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				slug TEXT NOT NULL,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				content_markdown TEXT NOT NULL,
				hero_image TEXT,
				status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
				pub_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_status_pub_date ON posts (status, pub_date DESC)`),
	]);

	const postColumns = await db.prepare(`PRAGMA table_info(posts)`).all<{ name: string }>();
	const columnNames = new Set((postColumns.results ?? []).map((column) => column.name));

	if (!columnNames.has("content") && columnNames.has("content_markdown")) {
		await db.prepare(`ALTER TABLE posts RENAME COLUMN content_markdown TO content`).run();
	}

	await db
		.prepare(
			`UPDATE posts
			SET slug = CASE
				WHEN json_valid(slug) THEN slug
				ELSE json_object('en', slug)
			END,
			title = CASE
				WHEN json_valid(title) THEN title
				ELSE json_object('en', title)
			END,
			description = CASE
				WHEN json_valid(description) THEN description
				ELSE json_object('en', description)
			END,
			content = CASE
				WHEN json_valid(content) THEN content
				ELSE json_object('en', content)
			END`,
		)
		.run();
}

function toSitePage(row: SitePageRecord, requestedLanguage = DEFAULT_LANGUAGE, catalog?: LanguageCatalogState): SitePage {
	const c = catalogOrFallback(catalog);
	const pageSections = parsePageSections(row.page_sections, row.show_posts_section);
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const contentTranslations = normalizeLocalizedText(row.content, {
		fallbackValue: row.content,
		defaultLanguageCode: c.defaultLanguageCode,
	});
	const language = resolveLanguage(requestedLanguage, c);
	const title = resolveLocalizedValue(titleTranslations, language, c);
	const content = resolveLocalizedValue(contentTranslations, language, c);

	return {
		id: row.id,
		title,
		titleTranslations,
		showTitle: row.show_title !== 0,
		slug: row.slug,
		description: row.description,
		content,
		contentTranslations,
		contentHtml: renderMarkdown(content),
		pageSections,
		status: row.status,
		updatedAt: new Date(row.updated_at),
		requestedLanguage: language,
		resolvedLanguage:
			titleTranslations[language]?.trim() && contentTranslations[language]?.trim()
				? language
				: c.defaultLanguageCode,
	};
}

function parsePageSections(value?: string | null, legacyShowPosts?: number): PageSectionConfig[] {
	if (value) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				const normalized = normalizePageSections(parsed);
				if (normalized.length > 0) {
					return normalized;
				}
			}
		} catch {
			// Ignore malformed historical content and fall back to legacy field.
		}
	}

	return legacyShowPosts
		? [
				{ type: "page_content", order: 1 },
				{ type: "blog_feed", order: 2 },
			]
		: [{ type: "page_content", order: 1 }];
}

function parsePageSectionsForm(formData: FormData): PageSectionConfig[] {
	const rawConfig = optionalString(formData, "pageSectionsConfig");
	if (!rawConfig) {
		return normalizePageSections([{ type: "page_content", order: 1 }]);
	}

	try {
		const parsed = JSON.parse(rawConfig);
		if (!Array.isArray(parsed)) {
			throw new Error();
		}

		const normalized = normalizePageSections(parsed);
		if (normalized.length === 0) {
			throw new Error();
		}

		return normalized;
	} catch {
		throw new Error("Page sections configuration is invalid.");
	}
}

function normalizePageSections(input: unknown[]): PageSectionConfig[] {
	const allowedTypes = new Set<PageSectionType>([
		"page_content",
		"blog_feed",
		"banner_slider",
		"contact_form",
	]);

	const normalized = input
		.map((item, index) => {
			if (typeof item === "string") {
				if (!allowedTypes.has(item as PageSectionType)) {
					return null;
				}
				return {
					type: item as PageSectionType,
					order: index + 1,
				} satisfies PageSectionConfig;
			}

			if (!item || typeof item !== "object") {
				return null;
			}

			const record = item as {
				type?: unknown;
				order?: unknown;
				bannerIds?: unknown;
				bannerUrls?: unknown;
				contactFormId?: unknown;
			};

			const rawType = record.type;
			if (typeof rawType !== "string" || !allowedTypes.has(rawType as PageSectionType)) {
				return null;
			}

			const rawOrder = record.order !== undefined ? Number(record.order) : index + 1;
			const order = Number.isFinite(rawOrder) ? Math.max(1, Math.floor(rawOrder)) : index + 1;
			const bannerIds =
				rawType === "banner_slider" && Array.isArray(record.bannerIds)
					? record.bannerIds
							.map((entry) => Number(entry))
							.filter((entry): entry is number => Number.isFinite(entry) && entry > 0)
					: undefined;
			const bannerUrls =
				rawType === "banner_slider" && Array.isArray(record.bannerUrls)
					? record.bannerUrls
							.filter((entry): entry is string => typeof entry === "string")
							.map((entry) => entry.trim())
							.filter(Boolean)
					: undefined;
			const contactFormId =
				rawType === "contact_form" && record.contactFormId !== undefined
					? Number(record.contactFormId)
					: undefined;

			return {
				type: rawType as PageSectionType,
				order,
				...(bannerIds && bannerIds.length ? { bannerIds } : {}),
				...(bannerUrls ? { bannerUrls } : {}),
				...(Number.isFinite(contactFormId) && contactFormId && contactFormId > 0 ? { contactFormId } : {}),
			} satisfies PageSectionConfig;
		})
		.filter((item): item is PageSectionConfig => Boolean(item));

	const deduped = normalized.filter(
		(section, index, sections) => sections.findIndex((entry) => entry.type === section.type) === index,
	);

	if (!deduped.some((section) => section.type === "page_content")) {
		deduped.push({ type: "page_content", order: 1 });
	}

	return normalizePayloadOrder(deduped);
}

function parseLocalizedFieldFromForm(
	formData: FormData,
	key: string,
	legacyKey: string,
	defaultLanguageCode?: string,
): LocalizedText {
	const rawValue = formData.get(key);
	const legacyValue = formData.get(legacyKey);
	return parseLocalizedFieldValue(rawValue ?? legacyValue, key, defaultLanguageCode);
}

function parseLocalizedSlugFieldFromForm(
	formData: FormData,
	key: string,
	legacyKey: string,
	defaultLanguageCode?: string,
): LocalizedText {
	const rawValue = formData.get(key);
	const legacyValue = formData.get(legacyKey);
	return parseLocalizedSlugFieldValue(rawValue ?? legacyValue, key, defaultLanguageCode);
}

function parseLocalizedFieldValue(value: unknown, fieldName: string, defaultLanguageCode?: string): LocalizedText {
	try {
		return normalizeLocalizedText(value, {
			requireDefault: true,
			defaultLanguageCode: defaultLanguageCode ?? DEFAULT_LANGUAGE,
		});
	} catch {
		throw new Error(`Invalid localized field: ${fieldName}`);
	}
}

function parseLocalizedSlugFieldValue(value: unknown, fieldName: string, defaultLanguageCode?: string): LocalizedText {
	try {
		return normalizeLocalizedSlugMap(value, {
			requireDefault: true,
			defaultLanguageCode: defaultLanguageCode ?? DEFAULT_LANGUAGE,
		});
	} catch {
		throw new Error(`Invalid localized field: ${fieldName}`);
	}
}

function requiredPayloadString(payload: unknown, key: string): string {
	const value = (payload as Record<string, unknown>)[key];
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`Missing field: ${key}`);
	}
	return value.trim();
}

function optionalPayloadString(payload: unknown, key: string): string {
	const value = (payload as Record<string, unknown>)[key];
	return typeof value === "string" ? value.trim() : "";
}

function sanitizeHexColor(value: string, fallback: string): string {
	const trimmed = value.trim();
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : fallback;
}

function normalizeHref(value: string): string {
	const trimmed = value.trim();
	if (/^https?:\/\//.test(trimmed)) {
		return trimmed;
	}
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function normalizeHomePageSlug(value: string): string {
	const trimmed = value.trim();
	if (trimmed === "" || trimmed === "/") {
		return "home";
	}

	const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, "");
	return slugify(withoutSlashes) || "home";
}

function normalizeFaviconUrl(value: string): string {
	const trimmed = value.trim();
	return trimmed || "/favicon.svg";
}

function normalizeLogoUrl(value: string): string {
	const trimmed = value.trim();
	return trimmed || "/logo.svg";
}

function normalizeStorageUrl(value: string): string {
	return value.trim().replace(/\/+$/g, "");
}

function isTruthyFormValue(value: FormDataEntryValue | null): boolean {
	return typeof value === "string" && ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parseBooleanSetting(value: string | undefined, fallback: boolean): boolean {
	if (typeof value !== "string") {
		return fallback;
	}

	const normalized = value.trim().toLowerCase();
	if (["1", "true", "yes", "on"].includes(normalized)) {
		return true;
	}
	if (["0", "false", "no", "off"].includes(normalized)) {
		return false;
	}

	return fallback;
}
