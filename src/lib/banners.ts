import { loadLanguageCatalog, type LanguageCatalogState } from "./languages";
import {
	DEFAULT_LANGUAGE,
	type LocalizedText,
	normalizeLocalizedText,
	resolveLanguage,
	resolveLocalizedValue,
	stringifyLocalizedText,
} from "./i18n";

export interface BannerRecord {
	id: number;
	title: string;
	titleTranslations: LocalizedText;
	imageUrl: string;
	headline: string;
	headlineTranslations: LocalizedText;
	caption: string;
	captionTranslations: LocalizedText;
	altText: string;
	linkUrl: string;
	isActive: boolean;
	sortOrder: number;
	updatedAt: Date;
	requestedLanguage: string;
	resolvedLanguage: string;
}

export interface BannerInput {
	titleTranslations: LocalizedText;
	imageUrl: string;
	headlineTranslations: LocalizedText;
	captionTranslations: LocalizedText;
	altText: string;
	linkUrl: string;
	isActive: boolean;
	sortOrder: number;
}

interface BannerRow {
	id: number;
	title: string;
	image_url: string;
	headline: string;
	caption: string;
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
				headline TEXT NOT NULL DEFAULT '',
				caption TEXT NOT NULL DEFAULT '',
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

	const bannerColumns = await db.prepare(`PRAGMA table_info(banners)`).all<{ name: string }>();
	const bannerColumnNames = new Set((bannerColumns.results ?? []).map((column) => column.name));
	if (!bannerColumnNames.has("headline")) {
		await db.prepare(`ALTER TABLE banners ADD COLUMN headline TEXT NOT NULL DEFAULT ''`).run();
	}
	if (!bannerColumnNames.has("caption")) {
		await db.prepare(`ALTER TABLE banners ADD COLUMN caption TEXT NOT NULL DEFAULT ''`).run();
	}

	await db
		.prepare(
			`UPDATE banners
			SET title = CASE
				WHEN json_valid(title) THEN title
				ELSE json_object('en', title)
			END,
			headline = CASE
				WHEN json_valid(headline) THEN headline
				ELSE json_object('en', headline)
			END,
			caption = CASE
				WHEN json_valid(caption) THEN caption
				ELSE json_object('en', caption)
			END`,
		)
		.run();
}

export async function listBanners(
	db: D1Database,
	activeOnly = false,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BannerRecord[]> {
	await ensureBannerTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));
	const query = activeOnly
		? `SELECT id, title, image_url, headline, caption, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		: `SELECT id, title, image_url, headline, caption, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			ORDER BY sort_order ASC, id ASC`;
	const result = await db.prepare(query).all<BannerRow>();
	return (result.results ?? []).map((row) => toBannerRecord(row, language, c));
}

export async function getBannerById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): Promise<BannerRecord | null> {
	await ensureBannerTables(db);
	const c = catalog ?? (await loadLanguageCatalog(db));
	const row = await db
		.prepare(
			`SELECT id, title, image_url, headline, caption, alt_text, link_url, is_active, sort_order, updated_at
			FROM banners
			WHERE id = ?1`,
		)
		.bind(id)
		.first<BannerRow>();
	return row ? toBannerRecord(row, language, c) : null;
}

export async function createBanner(db: D1Database, input: BannerInput): Promise<number> {
	await ensureBannerTables(db);
	const catalog = await loadLanguageCatalog(db);
	const result = await db
		.prepare(
			`INSERT INTO banners (title, image_url, headline, caption, alt_text, link_url, is_active, sort_order, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CURRENT_TIMESTAMP)`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations, catalog),
			normalizeImageUrl(input.imageUrl),
			serializeOptionalLocalizedText(input.headlineTranslations, catalog),
			serializeOptionalLocalizedText(input.captionTranslations, catalog),
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
	const catalog = await loadLanguageCatalog(db);
	await db
		.prepare(
			`UPDATE banners
			SET title = ?1,
				image_url = ?2,
				headline = ?3,
				caption = ?4,
				alt_text = ?5,
				link_url = ?6,
				is_active = ?7,
				sort_order = ?8,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?9`,
		)
		.bind(
			stringifyLocalizedText(input.titleTranslations, catalog),
			normalizeImageUrl(input.imageUrl),
			serializeOptionalLocalizedText(input.headlineTranslations, catalog),
			serializeOptionalLocalizedText(input.captionTranslations, catalog),
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

export function parseBannerForm(formData: FormData, defaultLanguageCode = DEFAULT_LANGUAGE): BannerInput {
	return {
		titleTranslations: parseLocalizedFieldValue(formData.get("title"), "title", defaultLanguageCode, true),
		imageUrl: requiredString(formData, "imageUrl"),
		headlineTranslations: parseLocalizedFieldValue(formData.get("headline"), "headline", defaultLanguageCode, false),
		captionTranslations: parseLocalizedFieldValue(formData.get("caption"), "caption", defaultLanguageCode, false),
		altText: optionalString(formData, "altText"),
		linkUrl: optionalString(formData, "linkUrl"),
		isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
		sortOrder: Number.parseInt(optionalString(formData, "sortOrder") || "0", 10) || 0,
	};
}

function toBannerRecord(row: BannerRow, requestedLanguage: string, catalog: LanguageCatalogState): BannerRecord {
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const headlineTranslations = normalizeLocalizedText(row.headline, {
		fallbackValue: row.headline,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const captionTranslations = normalizeLocalizedText(row.caption, {
		fallbackValue: row.caption,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const language = resolveLanguage(requestedLanguage, catalog);
	return {
		id: row.id,
		title: resolveLocalizedValue(titleTranslations, language, catalog),
		titleTranslations,
		imageUrl: row.image_url,
		headline: resolveLocalizedValue(headlineTranslations, language, catalog),
		headlineTranslations,
		caption: resolveLocalizedValue(captionTranslations, language, catalog),
		captionTranslations,
		altText: row.alt_text,
		linkUrl: row.link_url,
		isActive: row.is_active === 1,
		sortOrder: row.sort_order,
		updatedAt: new Date(row.updated_at),
		requestedLanguage: language,
		resolvedLanguage: (
			titleTranslations[language]?.trim() ||
			headlineTranslations[language]?.trim() ||
			captionTranslations[language]?.trim()
		)
			? language
			: catalog.defaultLanguageCode,
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

function parseLocalizedFieldValue(
	value: unknown,
	fieldName: string,
	defaultLanguageCode: string,
	requireDefault: boolean,
): LocalizedText {
	try {
		return normalizeLocalizedText(value, {
			requireDefault,
			defaultLanguageCode,
		});
	} catch {
		throw new Error(`Invalid localized field: ${fieldName}`);
	}
}

function serializeOptionalLocalizedText(translations: LocalizedText, catalog: LanguageCatalogState): string {
	const normalized = normalizeLocalizedText(translations, {
		requireDefault: false,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	if (Object.keys(normalized).length === 0) {
		return "";
	}

	if (!normalized[catalog.defaultLanguageCode]) {
		const fallback = Object.values(normalized).find((value) => value.trim());
		if (fallback) {
			normalized[catalog.defaultLanguageCode] = fallback;
		}
	}

	return stringifyLocalizedText(normalized, catalog);
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
