export interface BannerRecord {
	id: number;
	title: string;
	imageUrl: string;
	altText: string;
	linkUrl: string;
	isActive: boolean;
	sortOrder: number;
	updatedAt: Date;
}

export interface BannerInput {
	title: string;
	imageUrl: string;
	altText: string;
	linkUrl: string;
	isActive: boolean;
	sortOrder: number;
}

interface BannerRow {
	id: number;
	title: string;
	image_url: string;
	alt_text: string;
	link_url: string;
	is_active: number;
	sort_order: number;
	updated_at: string;
}

export async function ensureBannerTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS banners (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				image_url TEXT NOT NULL,
				alt_text TEXT NOT NULL DEFAULT '',
				link_url TEXT NOT NULL DEFAULT '',
				is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
				sort_order INTEGER NOT NULL DEFAULT 0,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_banners_sort_order
			ON banners (sort_order ASC, id ASC)`,
		),
	]);
}

export async function listBanners(db: D1Database, activeOnly = false): Promise<BannerRecord[]> {
	await ensureBannerTables(db);
	const query = activeOnly
		? `SELECT id, title, image_url, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		: `SELECT id, title, image_url, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			ORDER BY sort_order ASC, id ASC`;
	const result = await db.prepare(query).all<BannerRow>();
	return (result.results ?? []).map(toBannerRecord);
}

export async function getBannerById(db: D1Database, id: number): Promise<BannerRecord | null> {
	await ensureBannerTables(db);
	const row = await db
		.prepare(
			`SELECT id, title, image_url, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			WHERE id = ?1`,
		)
		.bind(id)
		.first<BannerRow>();
	return row ? toBannerRecord(row) : null;
}

export async function createBanner(db: D1Database, input: BannerInput): Promise<number> {
	await ensureBannerTables(db);
	const result = await db
		.prepare(
			`INSERT INTO banners (title, image_url, alt_text, link_url, is_active, sort_order, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.title.trim(),
			normalizeImageUrl(input.imageUrl),
			input.altText.trim(),
			normalizeLinkUrl(input.linkUrl),
			input.isActive ? 1 : 0,
			normalizeSortOrder(input.sortOrder),
		)
		.run();
	return Number(result.meta.last_row_id ?? 0);
}

export async function updateBanner(db: D1Database, id: number, input: BannerInput): Promise<void> {
	await ensureBannerTables(db);
	await db
		.prepare(
			`UPDATE banners
			SET title = ?1,
				image_url = ?2,
				alt_text = ?3,
				link_url = ?4,
				is_active = ?5,
				sort_order = ?6,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?7`,
		)
		.bind(
			input.title.trim(),
			normalizeImageUrl(input.imageUrl),
			input.altText.trim(),
			normalizeLinkUrl(input.linkUrl),
			input.isActive ? 1 : 0,
			normalizeSortOrder(input.sortOrder),
			id,
		)
		.run();
}

export async function deleteBanner(db: D1Database, id: number): Promise<void> {
	await ensureBannerTables(db);
	await db.prepare("DELETE FROM banners WHERE id = ?1").bind(id).run();
}

export function parseBannerForm(formData: FormData): BannerInput {
	return {
		title: requiredString(formData, "title"),
		imageUrl: requiredString(formData, "imageUrl"),
		altText: optionalString(formData, "altText"),
		linkUrl: optionalString(formData, "linkUrl"),
		isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
		sortOrder: Number.parseInt(optionalString(formData, "sortOrder") || "0", 10) || 0,
	};
}

function toBannerRecord(row: BannerRow): BannerRecord {
	return {
		id: row.id,
		title: row.title,
		imageUrl: row.image_url,
		altText: row.alt_text,
		linkUrl: row.link_url,
		isActive: row.is_active === 1,
		sortOrder: row.sort_order,
		updatedAt: new Date(row.updated_at),
	};
}

function requiredString(formData: FormData, key: string): string {
	const value = formData.get(key);
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`${key} is required.`);
	}
	return value.trim();
}

function optionalString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function normalizeImageUrl(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error("Banner image URL is required.");
	}
	if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) {
		return trimmed;
	}
	return `/${trimmed}`;
}

function normalizeLinkUrl(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}
	if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) {
		return trimmed;
	}
	return `/${trimmed}`;
}

function normalizeSortOrder(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
