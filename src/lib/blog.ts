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
