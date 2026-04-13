export interface TranslationEntryRow {
	localeCode: string;
	translationKey: string;
	translatedValue: string;
	updatedAt: string;
}

export interface TranslationBundleRow {
	translationKey: string;
	translations: Record<string, string>;
	updatedAt: string | null;
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

function bundleFromRows(rows: TranslationEntryRow[]): TranslationBundleRow | null {
	if (rows.length === 0) {
		return null;
	}

	const translations: Record<string, string> = {};
	let lastUpdatedMillis = -1;

	for (const row of rows) {
		translations[row.localeCode] = row.translatedValue;
		const parsed = Date.parse(row.updatedAt);
		if (!Number.isNaN(parsed) && parsed > lastUpdatedMillis) {
			lastUpdatedMillis = parsed;
		}
	}

	return {
		translationKey: rows[0]?.translationKey ?? "",
		translations,
		updatedAt: lastUpdatedMillis >= 0 ? new Date(lastUpdatedMillis).toISOString() : null,
	};
}

async function getEntry(db: D1Database, locale: string, key: string): Promise<TranslationEntryRow | null> {
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

export async function listTranslationEntriesByLocale(db: D1Database, locale: string): Promise<TranslationEntryRow[]> {
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

export async function listTranslationEntriesByKey(
	db: D1Database,
	translationKey: string,
): Promise<TranslationBundleRow | null> {
	const normalizedKey = translationKey.trim();
	if (!normalizedKey) {
		return null;
	}

	const result = await db
		.prepare(
			`SELECT locale_code, translation_key, translated_value, updated_at
			FROM translation_entries
			WHERE translation_key = ?1
			ORDER BY locale_code COLLATE NOCASE ASC`,
		)
		.bind(normalizedKey)
		.all<{
			locale_code: string;
			translation_key: string;
			translated_value: string;
			updated_at: string;
		}>();

	return bundleFromRows((result.results ?? []).map(rowFromDb));
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

	await db
		.prepare(
			`INSERT INTO translation_entries (locale_code, translation_key, translated_value)
			VALUES (?1, ?2, ?3)
			ON CONFLICT(locale_code, translation_key) DO UPDATE SET
				translated_value = excluded.translated_value,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(normalizedLocale, normalizedKey, normalizedValue)
		.run();

	const created = await getEntry(db, normalizedLocale, normalizedKey);
	if (!created) {
		throw new Error("Failed to create translation entry.");
	}

	return created;
}

export async function saveTranslationBundle(
	db: D1Database,
	translationKey: string,
	translations: Record<string, string>,
): Promise<TranslationBundleRow> {
	const normalizedKey = translationKey.trim();
	if (!normalizedKey) {
		throw new Error("Translation key is required.");
	}

	const entries = Object.entries(translations)
		.map(([localeCode, value]) => [normalizeLocaleCode(localeCode), String(value ?? "").trim()] as const)
		.filter(([localeCode]) => LOCALE_PATTERN.test(localeCode));

	if (entries.length === 0) {
		throw new Error("At least one translation value is required.");
	}

	if (!entries.some(([, value]) => value)) {
		throw new Error("At least one translation value is required.");
	}

	let touched = false;
	for (const [localeCode, value] of entries) {
		if (value) {
			await insertTranslationEntry(db, localeCode, normalizedKey, value);
			touched = true;
			continue;
		}

		const existing = await getEntry(db, localeCode, normalizedKey);
		if (existing) {
			await deleteTranslationEntry(db, localeCode, normalizedKey);
			touched = true;
		}
	}

	if (!touched) {
		throw new Error("At least one translation value is required.");
	}

	const bundle = await listTranslationEntriesByKey(db, normalizedKey);
	if (!bundle) {
		throw new Error("Failed to save translation bundle.");
	}

	return bundle;
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

	await db
		.prepare(
			`INSERT INTO translation_entries (locale_code, translation_key, translated_value)
			VALUES (?1, ?2, ?3)
			ON CONFLICT(locale_code, translation_key) DO UPDATE SET
				translated_value = excluded.translated_value,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(normalizedLocale, normalizedKey, normalizedValue)
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
