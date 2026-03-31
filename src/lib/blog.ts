import { micromark } from "micromark";

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

export interface SiteNavItem {
	label: string;
	href: string;
	sortOrder: number;
}

export interface SiteConfig {
	siteTitle: string;
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	navItems: SiteNavItem[];
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
			`SELECT site_title, header_background, header_text_color, header_accent_color
			FROM site_settings
			WHERE id = 1`,
		)
		.first<{
			site_title: string;
			header_background: string;
			header_text_color: string;
			header_accent_color: string;
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
		headerBackground: settings?.header_background ?? "#ffffff",
		headerTextColor: settings?.header_text_color ?? "#0f1219",
		headerAccentColor: settings?.header_accent_color ?? "#2337ff",
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
		headerBackground: string;
		headerTextColor: string;
		headerAccentColor: string;
		navItems: SiteNavItem[];
	},
): Promise<void> {
	await ensureSiteTables(db);

	const statements = [
		db
			.prepare(
				`INSERT INTO site_settings (id, site_title, header_background, header_text_color, header_accent_color, updated_at)
				VALUES (1, ?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					site_title = excluded.site_title,
					header_background = excluded.header_background,
					header_text_color = excluded.header_text_color,
					header_accent_color = excluded.header_accent_color,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(
				input.siteTitle.trim(),
				sanitizeHexColor(input.headerBackground, "#ffffff"),
				sanitizeHexColor(input.headerTextColor, "#0f1219"),
				sanitizeHexColor(input.headerAccentColor, "#2337ff"),
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

export function getAdminToken(locals: App.Locals): string | undefined {
	const token = locals.runtime.env.CMS_ADMIN_TOKEN?.trim();
	return token ? token : undefined;
}

export function isAdminAuthenticated(request: Request, locals: App.Locals): boolean {
	const token = getAdminToken(locals);
	if (!token) {
		return true;
	}

	const cookies = request.headers.get("cookie") ?? "";
	return cookies
		.split(";")
		.map((part) => part.trim())
		.some((part) => part === `cms_admin_token=${encodeURIComponent(token)}`);
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
	headerBackground: string;
	headerTextColor: string;
	headerAccentColor: string;
	navItems: SiteNavItem[];
} {
	const siteTitle = requiredString(formData, "siteTitle");
	const headerBackground = optionalString(formData, "headerBackground") || "#ffffff";
	const headerTextColor = optionalString(formData, "headerTextColor") || "#0f1219";
	const headerAccentColor = optionalString(formData, "headerAccentColor") || "#2337ff";
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
		headerBackground,
		headerTextColor,
		headerAccentColor,
		navItems,
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
			`INSERT INTO site_settings (id, site_title, header_background, header_text_color, header_accent_color)
			VALUES (1, 'Edge CMS', '#ffffff', '#0f1219', '#2337ff')
			ON CONFLICT(id) DO NOTHING`,
		),
		db.prepare(
			`INSERT INTO navigation_items (label, href, sort_order, is_visible)
			SELECT 'Home', '/', 0, 1
			WHERE NOT EXISTS (SELECT 1 FROM navigation_items)`,
		),
		db.prepare(
			`INSERT INTO navigation_items (label, href, sort_order, is_visible)
			SELECT 'Blog', '/blog', 1, 1
			WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE href = '/blog')`,
		),
		db.prepare(
			`INSERT INTO navigation_items (label, href, sort_order, is_visible)
			SELECT 'About', '/about', 2, 1
			WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE href = '/about')`,
		),
	]);
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
