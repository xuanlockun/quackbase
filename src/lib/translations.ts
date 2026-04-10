export interface TranslationEntryRow {
	localeCode: string;
	translationKey: string;
	translatedValue: string;
	updatedAt: string;
}

const LOCALE_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

function normalizeLocaleCode(locale: string): string {
	return locale.trim().toLowerCase();
}

function ensureValidLocale(locale: string): string {
	const normalized = normalizeLocaleCode(locale);
	if (!LOCALE_PATTERN.test(normalized)) {
		throw new Error("Invalid locale code.");
	}
	return normalized;
}

function rowFromDb(row: {
	locale_code: string;
	translation_key: string;
	translated_value: string;
	updated_at: string;
}): TranslationEntryRow {
	return {
		localeCode: row.locale_code,
		translationKey: row.translation_key,
		translatedValue: row.translated_value,
		updatedAt: row.updated_at,
	};
}

async function getEntry(
	db: D1Database,
	locale: string,
	key: string,
): Promise<TranslationEntryRow | null> {
	const normalizedLocale = ensureValidLocale(locale);
	const normalizedKey = key.trim();
	if (!normalizedKey) {
		return null;
	}

	const row = await db
		.prepare(
			`SELECT locale_code, translation_key, translated_value, updated_at
			FROM translation_entries
			WHERE locale_code = ?1 AND translation_key = ?2
			LIMIT 1`,
		)
		.bind(normalizedLocale, normalizedKey)
		.first<{
			locale_code: string;
			translation_key: string;
			translated_value: string;
			updated_at: string;
		}>();

	return row ? rowFromDb(row) : null;
}

export async function listTranslationEntriesByLocale(
	db: D1Database,
	locale: string,
): Promise<TranslationEntryRow[]> {
	const normalizedLocale = ensureValidLocale(locale);
	const result = await db
		.prepare(
			`SELECT locale_code, translation_key, translated_value, updated_at
			FROM translation_entries
			WHERE locale_code = ?1
			ORDER BY translation_key COLLATE NOCASE ASC`,
		)
		.bind(normalizedLocale)
		.all<{
			locale_code: string;
			translation_key: string;
			translated_value: string;
			updated_at: string;
		}>();

	return (result.results ?? []).map(rowFromDb);
}

export async function insertTranslationEntry(
	db: D1Database,
	locale: string,
	translationKey: string,
	translatedValue: string,
): Promise<TranslationEntryRow> {
	const normalizedLocale = ensureValidLocale(locale);
	const normalizedKey = translationKey.trim();
	const normalizedValue = translatedValue.trim();

	if (!normalizedKey) {
		throw new Error("Translation key is required.");
	}

	if (!normalizedValue) {
		throw new Error("Translation value is required.");
	}

	const existing = await getEntry(db, normalizedLocale, normalizedKey);
	if (existing) {
		throw new Error("Translation key already exists for this locale.");
	}

	await db
		.prepare(
			`INSERT INTO translation_entries (locale_code, translation_key, translated_value)
			VALUES (?1, ?2, ?3)`,
		)
		.bind(normalizedLocale, normalizedKey, normalizedValue)
		.run();

	const created = await getEntry(db, normalizedLocale, normalizedKey);
	if (!created) {
		throw new Error("Failed to create translation entry.");
	}

	return created;
}

export async function updateTranslationEntry(
	db: D1Database,
	locale: string,
	translationKey: string,
	translatedValue: string,
): Promise<TranslationEntryRow> {
	const normalizedLocale = ensureValidLocale(locale);
	const normalizedKey = translationKey.trim();
	const normalizedValue = translatedValue.trim();

	if (!normalizedKey) {
		throw new Error("Translation key is required.");
	}

	if (!normalizedValue) {
		throw new Error("Translation value is required.");
	}

	const existing = await getEntry(db, normalizedLocale, normalizedKey);
	if (!existing) {
		throw new Error("Translation entry not found.");
	}

	await db
		.prepare(
			`UPDATE translation_entries
			SET translated_value = ?1,
				updated_at = CURRENT_TIMESTAMP
			WHERE locale_code = ?2 AND translation_key = ?3`,
		)
		.bind(normalizedValue, normalizedLocale, normalizedKey)
		.run();

	const updated = await getEntry(db, normalizedLocale, normalizedKey);
	if (!updated) {
		throw new Error("Translation entry update failed.");
	}

	return updated;
}

export async function deleteTranslationEntry(
	db: D1Database,
	locale: string,
	translationKey: string,
): Promise<void> {
	const normalizedLocale = ensureValidLocale(locale);
	const normalizedKey = translationKey.trim();

	if (!normalizedKey) {
		throw new Error("Translation key is required.");
	}

	const existing = await getEntry(db, normalizedLocale, normalizedKey);
	if (!existing) {
		throw new Error("Translation entry not found.");
	}

	await db
		.prepare(`DELETE FROM translation_entries WHERE locale_code = ?1 AND translation_key = ?2`)
		.bind(normalizedLocale, normalizedKey)
		.run();
}
