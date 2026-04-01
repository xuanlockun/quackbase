import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

export interface BlogPostRecord {
	id: number;
	slug: string;
	title: string;
	description: string;
	content_markdown: string;
	hero_image: string | null;
	status: string;
	pub_date: string;
	updated_date: string;
}

export interface BlogPost {
	id: number;
	slug: string;
	title: string;
	description: string;
	contentMarkdown: string;
	contentHtml: string;
	heroImage?: string;
	status: string;
	pubDate: Date;
	updatedDate?: Date;
}

export interface BlogPostInput {
	title: string;
	slug: string;
	description: string;
	contentMarkdown: string;
	heroImage?: string;
	status: string;
	pubDate?: string;
}

export interface AdminPostSummary {
	id: number;
	title: string;
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
	contentMarkdown: string;
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
	content_markdown: string;
	show_posts_section: number;
	page_sections?: string | null;
	status: string;
	updated_at: string;
}

export interface SitePage {
	id: number;
	title: string;
	slug: string;
	description: string;
	contentMarkdown: string;
	contentHtml: string;
	pageSections: string[];
	status: string;
	updatedAt: Date;
}

export interface SitePageInput {
	title: string;
	slug: string;
	description: string;
	contentMarkdown: string;
	pageSections: string[];
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

export function toBlogPost(row: BlogPostRecord): BlogPost {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		description: row.description,
		contentMarkdown: row.content_markdown,
		contentHtml: renderMarkdown(row.content_markdown),
		heroImage: row.hero_image ?? undefined,
		status: row.status,
		pubDate: new Date(row.pub_date),
		updatedDate: row.updated_date ? new Date(row.updated_date) : undefined,
	};
}

export async function listPublishedPosts(db: D1Database): Promise<BlogPost[]> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content_markdown, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE status = 'published'
			ORDER BY datetime(pub_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map(toBlogPost);
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

export async function listAllPages(db: D1Database): Promise<SitePage[]> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content_markdown, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map(toSitePage);
}

export async function listPublishedPages(db: D1Database): Promise<SitePage[]> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content_markdown, show_posts_section, page_sections, status, updated_at
			FROM site_pages
			WHERE status = 'published'
			ORDER BY datetime(updated_at) DESC, id DESC`,
		)
		.all<SitePageRecord>();

	return (result.results ?? []).map(toSitePage);
}

export async function getPublishedPageBySlug(
	db: D1Database,
	slug: string,
): Promise<SitePage | null> {
	await ensureSiteTables(db);

	const result = await db
		.prepare(
			`SELECT id, title, slug, description, content_markdown, show_posts_section, status, updated_at
			, page_sections
			FROM site_pages
			WHERE slug = ?1 AND status = 'published'
			LIMIT 1`,
		)
		.bind(slug)
		.first<SitePageRecord>();

	return result ? toSitePage(result) : null;
}

export async function createPage(db: D1Database, input: SitePageInput): Promise<void> {
	await ensureSiteTables(db);

	await db
		.prepare(
			`INSERT INTO site_pages (title, slug, description, content_markdown, show_posts_section, status, updated_at, page_sections)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, ?7)`,
		)
		.bind(
			input.title,
			input.slug,
			input.description,
			input.contentMarkdown,
			input.pageSections.includes("blog_feed") ? 1 : 0,
			input.status,
			JSON.stringify(input.pageSections),
		)
		.run();
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
				content_markdown = ?4,
				show_posts_section = ?5,
				status = ?6,
				updated_at = CURRENT_TIMESTAMP,
				page_sections = ?7
			WHERE id = ?8`,
		)
		.bind(
			input.title,
			input.slug,
			input.description,
			input.contentMarkdown,
			input.pageSections.includes("blog_feed") ? 1 : 0,
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

export async function listAllPosts(db: D1Database): Promise<BlogPost[]> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content_markdown, hero_image, status, pub_date, updated_date
			FROM posts
			ORDER BY datetime(updated_date) DESC, id DESC`,
		)
		.all<BlogPostRecord>();

	return (result.results ?? []).map(toBlogPost);
}

export async function getPostById(db: D1Database, id: number): Promise<BlogPost | null> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content_markdown, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<BlogPostRecord>();

	return result ? toBlogPost(result) : null;
}

export function toAdminPostSummary(post: BlogPost): AdminPostSummary {
	return {
		id: post.id,
		title: post.title,
		description: post.description,
		slug: post.slug,
		status: post.status,
		updatedAt: (post.updatedDate ?? post.pubDate).toISOString(),
		viewHref: `/blog/${post.slug}/`,
		editHref: `/admin/posts/${post.id}/edit`,
	};
}

export function toAdminPostDetail(post: BlogPost): AdminPostDetail {
	return {
		...toAdminPostSummary(post),
		heroImage: post.heroImage ?? null,
		pubDate: post.pubDate.toISOString(),
		contentMarkdown: post.contentMarkdown,
	};
}

export async function getPublishedPostBySlug(
	db: D1Database,
	slug: string,
): Promise<BlogPost | null> {
	const result = await db
		.prepare(
			`SELECT id, slug, title, description, content_markdown, hero_image, status, pub_date, updated_date
			FROM posts
			WHERE slug = ?1 AND status = 'published'
			LIMIT 1`,
		)
		.bind(slug)
		.first<BlogPostRecord>();

	return result ? toBlogPost(result) : null;
}

export async function createPost(db: D1Database, input: BlogPostInput): Promise<void> {
	await db
		.prepare(
			`INSERT INTO posts (slug, title, description, content_markdown, hero_image, status, pub_date, updated_date)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.slug,
			input.title,
			input.description,
			input.contentMarkdown,
			normalizeOptionalString(input.heroImage),
			input.status,
			normalizePubDate(input.pubDate),
		)
		.run();
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
				content_markdown = ?4,
				hero_image = ?5,
				status = ?6,
				pub_date = ?7,
				updated_date = CURRENT_TIMESTAMP
			WHERE id = ?8`,
		)
		.bind(
			input.slug,
			input.title,
			input.description,
			input.contentMarkdown,
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
	const title = requiredString(formData, "title");
	const slug = slugify(requiredString(formData, "slug"));
	const description = requiredString(formData, "description");
	const contentMarkdown = requiredString(formData, "contentMarkdown");
	const status = normalizeStatus(requiredString(formData, "status"));
	const heroImage = optionalString(formData, "heroImage");
	const pubDate = optionalString(formData, "pubDate");

	return {
		title,
		slug,
		description,
		contentMarkdown,
		heroImage: heroImage || undefined,
		status,
		pubDate: pubDate || undefined,
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
	const rawSections = formData
		.getAll("pageSections")
		.filter((value): value is string => typeof value === "string")
		.map((value) => value.trim())
		.filter((value) => ["blog_feed", "nav_grid", "page_grid"].includes(value));

	return {
		title: requiredString(formData, "title"),
		slug: slugify(requiredString(formData, "slug")),
		description: requiredString(formData, "description"),
		contentMarkdown: requiredString(formData, "contentMarkdown"),
		pageSections: [...new Set(rawSections)],
		status: normalizeStatus(requiredString(formData, "status")),
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
				content_markdown TEXT NOT NULL,
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

function toSitePage(row: SitePageRecord): SitePage {
	const pageSections = parsePageSections(row.page_sections, row.show_posts_section);

	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		description: row.description,
		contentMarkdown: row.content_markdown,
		contentHtml: renderMarkdown(row.content_markdown),
		pageSections,
		status: row.status,
		updatedAt: new Date(row.updated_at),
	};
}

function parsePageSections(value?: string | null, legacyShowPosts?: number): string[] {
	if (value) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				return parsed.filter((item): item is string =>
					typeof item === "string" && ["blog_feed", "nav_grid", "page_grid"].includes(item),
				);
			}
		} catch {
			// Ignore malformed historical content and fall back to legacy field.
		}
	}

	return legacyShowPosts ? ["blog_feed"] : [];
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
