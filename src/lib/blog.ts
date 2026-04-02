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
	title: string;
	titleTranslations: LocalizedText;
	description: string;
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
	titleTranslations: LocalizedText;
	slug: string;
	description: string;
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
	slug: string;
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
	href: string;
	sortOrder: number;
}

export interface SiteConfig {
	siteTitle: string;
	homePageSlug: string;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	footerText: string;
	footerBackground: string;
	footerTextColor: string;
	navItems: SiteNavItem[];
}

export interface SitePageRecord {
	id: number;
	title: string;
	slug: string;
	description: string;
	content: string;
	show_posts_section: number;
	page_sections?: string | null;
	status: string;
	updated_at: string;
}

export interface SitePage {
	id: number;
	title: string;
	titleTranslations: LocalizedText;
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
	bannerUrls?: string[];
}

export interface SitePageInput {
	titleTranslations: LocalizedText;
	slug: string;
	description: string;
	contentTranslations: LocalizedText;
	pageSections: PageSectionConfig[];
	status: string;
}

export function getDb(locals: App.Locals): D1Database {
	const db = locals.runtime.env.DB;
	if (!db) {
		throw new Error("D1 binding `DB` is not configured.");
	}
	return db;
}

export function renderMarkdown(markdown: string): string {
	return micromark(markdown, {
		allowDangerousHtml: false,
		extensions: [gfm()],
		htmlExtensions: [gfmHtml()],
	});
}

export { getDefaultLanguage, getSupportedLanguages, getLocalizedPagePath, getLocalizedPostPath } from "./i18n";

export function toBlogPost(row: BlogPostRecord, requestedLanguage = DEFAULT_LANGUAGE): BlogPost {
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
	});
	const contentTranslations = normalizeLocalizedText(row.content, {
		fallbackValue: row.content,
	});
	const language = resolveLanguage(requestedLanguage);
	const title = resolveLocalizedValue(titleTranslations, language);
	const content = resolveLocalizedValue(contentTranslations, language);

	return {
		id: row.id,
		slug: row.slug,
		title,
		titleTranslations,
		description: row.description,
		content,
		contentTranslations,
		contentHtml: renderMarkdown(content),
		heroImage: row.hero_image ?? undefined,
		status: row.status,
		pubDate: new Date(row.pub_date),
		updatedDate: row.updated_date ? new Date(row.updated_date) : undefined,
		requestedLanguage: language,
		resolvedLanguage:
			titleTranslations[language]?.trim() && contentTranslations[language]?.trim() ? language : DEFAULT_LANGUAGE,
	};
}

export async function listPublishedPosts(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
): Promise<BlogPost[]> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE status = 'published'
			ORDER BY datetime(pub_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map((row) => toBlogPost(row, language));
}

export async function getSiteConfig(db: D1Database): Promise<SiteConfig> {
	await ensureSiteTables(db);

	const settings = await db
		.prepare(
			`SELECT site_title, home_page_slug, header_background, header_text_color, header_accent_color
			FROM site_settings
			WHERE id = 1`,
		)
		.first<{
			site_title: string;
			home_page_slug: string;
			header_background: string;
			header_text_color: string;
			header_accent_color: string;
		}>();

	const footerSettings = await db
		.prepare(
			`SELECT footer_text, footer_background, footer_text_color
			FROM footer_settings
			WHERE id = 1`,
		)
		.first<{
			footer_text: string;
			footer_background: string;
			footer_text_color: string;
		}>();

	const navResult = await db
		.prepare(
			`SELECT label, href, sort_order
			FROM navigation_items
			WHERE is_visible = 1
			ORDER BY sort_order ASC, id ASC`,
		)
		.all<{ label: string; href: string; sort_order: number }>();

	return {
		siteTitle: settings?.site_title ?? "Edge CMS",
		homePageSlug: settings?.home_page_slug ?? "home",
		headerBackground: settings?.header_background ?? "#ffffff",
		headerTextColor: settings?.header_text_color ?? "#0f1219",
		headerAccentColor: settings?.header_accent_color ?? "#2337ff",
		footerText: footerSettings?.footer_text ?? "Edge CMS. Content updates go live straight from D1.",
		footerBackground: footerSettings?.footer_background ?? "#eef2f7",
		footerTextColor: footerSettings?.footer_text_color ?? "#60739f",
		navItems: (navResult.results ?? []).map((item) => ({
			label: item.label,
			href: item.href,
			sortOrder: item.sort_order,
		})),
	};
}

export async function saveSiteConfig(
	db: D1Database,
	input: {
		siteTitle: string;
		homePageSlug: string;
		headerBackground: string;
		headerTextColor: string;
		headerAccentColor: string;
		footerText: string;
		footerBackground: string;
		footerTextColor: string;
		navItems: SiteNavItem[];
	},
): Promise<void> {
	await ensureSiteTables(db);

	const statements = [
		db
			.prepare(
				`INSERT INTO site_settings (id, site_title, home_page_slug, header_background, header_text_color, header_accent_color, updated_at)
				VALUES (1, ?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					site_title = excluded.site_title,
					home_page_slug = excluded.home_page_slug,
					header_background = excluded.header_background,
					header_text_color = excluded.header_text_color,
					header_accent_color = excluded.header_accent_color,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(
				input.siteTitle.trim(),
				normalizeHomePageSlug(input.homePageSlug),
				sanitizeHexColor(input.headerBackground, "#ffffff"),
				sanitizeHexColor(input.headerTextColor, "#0f1219"),
				sanitizeHexColor(input.headerAccentColor, "#2337ff"),
			),
		db
			.prepare(
				`INSERT INTO footer_settings (id, footer_text, footer_background, footer_text_color, updated_at)
				VALUES (1, ?1, ?2, ?3, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					footer_text = excluded.footer_text,
					footer_background = excluded.footer_background,
					footer_text_color = excluded.footer_text_color,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(
				input.footerText.trim() || "Edge CMS. Content updates go live straight from D1.",
				sanitizeHexColor(input.footerBackground, "#eef2f7"),
				sanitizeHexColor(input.footerTextColor, "#60739f"),
			),
		db.prepare(`DELETE FROM navigation_items`),
		...input.navItems.map((item, index) =>
			db
				.prepare(
					`INSERT INTO navigation_items (label, href, sort_order, is_visible)
					VALUES (?1, ?2, ?3, 1)`,
				)
				.bind(item.label.trim(), normalizeHref(item.href), index),
		),
	];

	await db.batch(statements);
}

export async function listAllPages(db: D1Database, language = DEFAULT_LANGUAGE): Promise<SitePage[]> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map((row) => toSitePage(row, language));
}

export async function listPublishedPages(
	db: D1Database,
	language = DEFAULT_LANGUAGE,
): Promise<SitePage[]> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			WHERE status = 'published'
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map((row) => toSitePage(row, language));
}

export async function getPageById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
): Promise<SitePage | null> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<SitePageRecord>();

	return result ? toSitePage(result, language) : null;
}

export async function getPublishedPageBySlug(
	db: D1Database,
	slug: string,
	language = DEFAULT_LANGUAGE,
): Promise<SitePage | null> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content, show_posts_section, status, updated_at
			, page_sections
			FROM site_pages
			WHERE slug = ?1 AND status = 'published'
			LIMIT 1`,
		)
		.bind(slug)
		.first<SitePageRecord>();

	return result ? toSitePage(result, language) : null;
}

export async function createPage(db: D1Database, input: SitePageInput): Promise<number> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`INSERT INTO site_pages (title, slug, description, content, show_posts_section, status, updated_at, page_sections)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, ?7)`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations),
			input.slug,
			input.description,
			stringifyLocalizedText(input.contentTranslations),
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

	await db
		.prepare(
			`UPDATE site_pages
			SET title = ?1,
				slug = ?2,
				description = ?3,
				content = ?4,
				show_posts_section = ?5,
				status = ?6,
				updated_at = CURRENT_TIMESTAMP,
				page_sections = ?7
			WHERE id = ?8`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations),
			input.slug,
			input.description,
			stringifyLocalizedText(input.contentTranslations),
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

export async function listAllPosts(db: D1Database, language = DEFAULT_LANGUAGE): Promise<BlogPost[]> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			ORDER BY datetime(updated_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map((row) => toBlogPost(row, language));
}

export async function getPostById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
): Promise<BlogPost | null> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<BlogPostRecord>();

	return result ? toBlogPost(result, language) : null;
}

export function toAdminPostSummary(
	post: BlogPost,
	language = DEFAULT_LANGUAGE,
): AdminPostSummary {
	return {
		id: post.id,
		title: resolveLocalizedValue(post.titleTranslations, language),
		titleTranslations: post.titleTranslations,
		description: post.description,
		slug: post.slug,
		status: post.status,
		updatedAt: (post.updatedDate ?? post.pubDate).toISOString(),
		viewHref: getLocalizedPostPath(post.slug, language),
		editHref: `/admin/posts/${post.id}/edit`,
	};
}

export function toAdminPostDetail(
	post: BlogPost,
	language = DEFAULT_LANGUAGE,
): AdminPostDetail {
	return {
		...toAdminPostSummary(post, language),
		heroImage: post.heroImage ?? null,
		pubDate: post.pubDate.toISOString(),
		content: resolveLocalizedValue(post.contentTranslations, language),
		contentTranslations: post.contentTranslations,
		requestedLanguage: resolveLanguage(language),
		resolvedLanguage: post.resolvedLanguage,
	};
}

export async function getPublishedPostBySlug(
	db: D1Database,
	slug: string,
	language = DEFAULT_LANGUAGE,
): Promise<BlogPost | null> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE slug = ?1 AND status = 'published'
			LIMIT 1`,
		)
		.bind(slug)
		.first<BlogPostRecord>();

	return result ? toBlogPost(result, language) : null;
}

export async function createPost(db: D1Database, input: BlogPostInput): Promise<number> {
	const result = await db
		.prepare(
			`INSERT INTO posts (slug, title, description, content, hero_image, status, pub_date, updated_date)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.slug,
			stringifyLocalizedText(input.titleTranslations),
			input.description,
			stringifyLocalizedText(input.contentTranslations),
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
			input.slug,
			stringifyLocalizedText(input.titleTranslations),
			input.description,
			stringifyLocalizedText(input.contentTranslations),
			normalizeOptionalString(input.heroImage),
			input.status,
			normalizePubDate(input.pubDate),
			id,
		)
		.run();
}

export async function deletePost(db: D1Database, id: number): Promise<void> {
	await db.prepare("DELETE FROM posts WHERE id = ?1").bind(id).run();
}

export function parsePostForm(formData: FormData): BlogPostInput {
	return {
		titleTranslations: parseLocalizedFieldFromForm(formData, "title", "title_en"),
		slug: slugify(requiredString(formData, "slug")),
		description: requiredString(formData, "description"),
		contentTranslations: parseLocalizedFieldFromForm(formData, "content", "content_en"),
		heroImage: optionalString(formData, "heroImage") || undefined,
		status: normalizeStatus(requiredString(formData, "status")),
		pubDate: optionalString(formData, "pubDate") || undefined,
	};
}

export function parsePostPayload(payload: unknown): BlogPostInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid post payload.");
	}

	return {
		titleTranslations: parseLocalizedFieldValue((payload as Record<string, unknown>).title, "title"),
		slug: slugify(requiredPayloadString(payload, "slug")),
		description: requiredPayloadString(payload, "description"),
		contentTranslations: parseLocalizedFieldValue((payload as Record<string, unknown>).content, "content"),
		heroImage: optionalPayloadString(payload, "heroImage") || undefined,
		status: normalizeStatus(requiredPayloadString(payload, "status")),
		pubDate: optionalPayloadString(payload, "pubDate") || undefined,
	};
}

export function parseSiteForm(formData: FormData): {
	siteTitle: string;
	homePageSlug: string;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	footerText: string;
	footerBackground: string;
	footerTextColor: string;
	navItems: SiteNavItem[];
} {
	const siteTitle = requiredString(formData, "siteTitle");
	const homePageSlug = requiredString(formData, "homePageSlug");
	const headerBackground = optionalString(formData, "headerBackground") || "#ffffff";
	const headerTextColor = optionalString(formData, "headerTextColor") || "#0f1219";
	const headerAccentColor = optionalString(formData, "headerAccentColor") || "#2337ff";
	const footerText =
		optionalString(formData, "footerText") || "Edge CMS. Content updates go live straight from D1.";
	const footerBackground = optionalString(formData, "footerBackground") || "#eef2f7";
	const footerTextColor = optionalString(formData, "footerTextColor") || "#60739f";
	const navRaw = optionalString(formData, "navItems");

	const navItems = navRaw
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
			return {
				label,
				href,
				sortOrder: index,
			};
		});

	return {
		siteTitle,
		homePageSlug,
		headerBackground,
		headerTextColor,
		headerAccentColor,
		footerText,
		footerBackground,
		footerTextColor,
		navItems,
	};
}

export function parsePageForm(formData: FormData): SitePageInput {
	const pageSections = parsePageSectionsForm(formData);

	return {
		titleTranslations: parseLocalizedFieldFromForm(formData, "title", "title_en"),
		slug: slugify(requiredString(formData, "slug")),
		description: requiredString(formData, "description"),
		contentTranslations: parseLocalizedFieldFromForm(formData, "content", "content_en"),
		pageSections,
		status: normalizeStatus(requiredString(formData, "status")),
	};
}

export function parsePagePayload(payload: unknown): SitePageInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid page payload.");
	}

	const record = payload as Record<string, unknown>;
	const pageSections: PageSectionConfig[] = Array.isArray(record.pageSections)
		? normalizePageSections(record.pageSections)
		: [{ type: "page_content", order: 1 }];

	return {
		titleTranslations: parseLocalizedFieldValue(record.title, "title"),
		slug: slugify(requiredPayloadString(payload, "slug")),
		description: requiredPayloadString(payload, "description"),
		contentTranslations: parseLocalizedFieldValue(record.content, "content"),
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

async function ensureSiteTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS site_settings (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				site_title TEXT NOT NULL DEFAULT 'Edge CMS',
				home_page_slug TEXT NOT NULL DEFAULT 'home',
				header_background TEXT NOT NULL DEFAULT '#ffffff',
				header_text_color TEXT NOT NULL DEFAULT '#0f1219',
				header_accent_color TEXT NOT NULL DEFAULT '#2337ff',
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
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
	]);

	const pageColumns = await db.prepare(`PRAGMA table_info(site_pages)`).all<{ name: string }>();
	const columnNames = new Set((pageColumns.results ?? []).map((column) => column.name));
	const settingsColumns = await db.prepare(`PRAGMA table_info(site_settings)`).all<{ name: string }>();
	const settingsColumnNames = new Set((settingsColumns.results ?? []).map((column) => column.name));

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
			`INSERT INTO site_settings (id, site_title, home_page_slug, header_background, header_text_color, header_accent_color)
			VALUES (1, 'Edge CMS', 'home', '#ffffff', '#0f1219', '#2337ff')
			ON CONFLICT(id) DO NOTHING`,
		),
		db.prepare(
			`INSERT INTO footer_settings (id, footer_text, footer_background, footer_text_color)
			VALUES (1, 'Edge CMS. Content updates go live straight from D1.', '#eef2f7', '#60739f')
			ON CONFLICT(id) DO NOTHING`,
		),
		db.prepare(
			`INSERT INTO navigation_items (label, href, sort_order, is_visible)
			SELECT 'Home', '/', 0, 1
			WHERE NOT EXISTS (SELECT 1 FROM navigation_items)`,
		),
	]);
}

function toSitePage(row: SitePageRecord, requestedLanguage = DEFAULT_LANGUAGE): SitePage {
	const pageSections = parsePageSections(row.page_sections, row.show_posts_section);
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
	});
	const contentTranslations = normalizeLocalizedText(row.content, {
		fallbackValue: row.content,
	});
	const language = resolveLanguage(requestedLanguage);
	const title = resolveLocalizedValue(titleTranslations, language);
	const content = resolveLocalizedValue(contentTranslations, language);

	return {
		id: row.id,
		title,
		titleTranslations,
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
			titleTranslations[language]?.trim() && contentTranslations[language]?.trim() ? language : DEFAULT_LANGUAGE,
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
	if (rawConfig) {
		try {
			const parsed = JSON.parse(rawConfig);
			if (Array.isArray(parsed)) {
				const normalized = normalizePageSections(parsed);
				if (normalized.length > 0) {
					return normalized;
				}
			}
		} catch {
			throw new Error("Page sections configuration is invalid.");
		}
	}

	const legacySections = formData
		.getAll("pageSections")
		.filter((value): value is string => typeof value === "string")
		.map((value) => value.trim())
		.filter((value) => ["blog_feed"].includes(value));

	return normalizePageSections(["page_content", ...legacySections]);
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
				bannerUrls?: unknown;
			};

			const rawType = record.type;
			if (typeof rawType !== "string" || !allowedTypes.has(rawType as PageSectionType)) {
				return null;
			}

			const rawOrder = record.order !== undefined ? Number(record.order) : index + 1;
			const order = Number.isFinite(rawOrder) ? Math.max(1, Math.floor(rawOrder)) : index + 1;
			const bannerUrls =
				rawType === "banner_slider" && Array.isArray(record.bannerUrls)
					? record.bannerUrls
							.filter((entry): entry is string => typeof entry === "string")
							.map((entry) => entry.trim())
							.filter(Boolean)
					: undefined;

			return {
				type: rawType as PageSectionType,
				order,
				...(bannerUrls ? { bannerUrls } : {}),
			} satisfies PageSectionConfig;
		})
		.filter((item): item is PageSectionConfig => Boolean(item));

	const deduped = normalized.filter(
		(section, index, sections) => sections.findIndex((entry) => entry.type === section.type) === index,
	);

	if (!deduped.some((section) => section.type === "page_content")) {
		deduped.push({ type: "page_content", order: 1 });
	}

	return deduped.sort((left, right) => left.order - right.order);
}

function parseLocalizedFieldFromForm(
	formData: FormData,
	key: string,
	legacyKey: string,
): LocalizedText {
	const rawValue = formData.get(key);
	const legacyValue = formData.get(legacyKey);
	return parseLocalizedFieldValue(rawValue ?? legacyValue, key);
}

function parseLocalizedFieldValue(value: unknown, fieldName: string): LocalizedText {
	try {
		return normalizeLocalizedText(value, {
			requireDefault: true,
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
