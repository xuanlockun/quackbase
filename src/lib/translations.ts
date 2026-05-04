import {
	createLanguage,
	listAllLanguages,
	type LanguageRow,
	updateLanguageByCode,
} from "./languages";

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

export interface TranslationExportPayload {
	version: 1;
	exportedAt: string;
	languages: Array<{
		code: string;
		name: string;
		enabled: boolean;
		isDefault: boolean;
	}>;
	translations: Record<string, Record<string, string>>;
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

export async function listAllTranslationBundles(db: D1Database): Promise<TranslationBundleRow[]> {
	const result = await db
		.prepare(
			`SELECT locale_code, translation_key, translated_value, updated_at
			FROM translation_entries
			ORDER BY translation_key COLLATE NOCASE ASC, locale_code COLLATE NOCASE ASC`,
		)
		.all<{
			locale_code: string;
			translation_key: string;
			translated_value: string;
			updated_at: string;
		}>();

	const bundles = new Map<string, TranslationEntryRow[]>();
	for (const row of (result.results ?? []).map(rowFromDb)) {
		const entries = bundles.get(row.translationKey) ?? [];
		entries.push(row);
		bundles.set(row.translationKey, entries);
	}

	return Array.from(bundles.values())
		.map((rows) => bundleFromRows(rows))
		.filter((bundle): bundle is TranslationBundleRow => Boolean(bundle));
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

export async function buildTranslationExportPayload(db: D1Database): Promise<TranslationExportPayload> {
	const [languages, bundles] = await Promise.all([listAllLanguages(db), listAllTranslationBundles(db)]);

	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		languages: languages.map((language) => ({
			code: language.code,
			name: language.name,
			enabled: language.enabled,
			isDefault: language.isDefault,
		})),
		translations: Object.fromEntries(
			bundles.map((bundle) => [bundle.translationKey, bundle.translations]),
		),
	};
}

export async function importTranslationExportPayload(
	db: D1Database,
	payload: unknown,
): Promise<{ languagesUpdated: number; translationsUpdated: number }> {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid translation import payload.");
	}

	const record = payload as Record<string, unknown>;
	const importedLanguages = Array.isArray(record.languages) ? record.languages : [];
	const importedTranslations =
		record.translations && typeof record.translations === "object" && !Array.isArray(record.translations)
			? (record.translations as Record<string, unknown>)
			: null;

	if (!importedTranslations) {
		throw new Error("Translation import payload must include a translations object.");
	}

	const existingLanguages = new Map<string, LanguageRow>(
		(await listAllLanguages(db)).map((language) => [language.code, language]),
	);

	let languagesUpdated = 0;
	for (const entry of importedLanguages) {
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
			continue;
		}

		const language = entry as Record<string, unknown>;
		const code = typeof language.code === "string" ? normalizeLocaleCode(language.code) : "";
		const name = typeof language.name === "string" ? language.name.trim() : "";
		if (!code || !name || !LOCALE_PATTERN.test(code)) {
			continue;
		}

		const existing = existingLanguages.get(code);
		if (!existing) {
			await createLanguage(db, {
				code,
				name,
				enabled: language.enabled !== false,
				isDefault: language.isDefault === true,
			});
			languagesUpdated += 1;
			continue;
		}

		await updateLanguageByCode(db, code, {
			name,
			enabled: typeof language.enabled === "boolean" ? language.enabled : existing.enabled,
			isDefault: language.isDefault === true,
		});
		languagesUpdated += 1;
	}

	let translationsUpdated = 0;
	for (const [translationKey, rawTranslations] of Object.entries(importedTranslations)) {
		if (!translationKey.trim() || !rawTranslations || typeof rawTranslations !== "object" || Array.isArray(rawTranslations)) {
			continue;
		}

		const translations: Record<string, string> = {};
		for (const [localeCode, translatedValue] of Object.entries(rawTranslations as Record<string, unknown>)) {
			if (!LOCALE_PATTERN.test(normalizeLocaleCode(localeCode)) || typeof translatedValue !== "string") {
				continue;
			}
			translations[normalizeLocaleCode(localeCode)] = translatedValue;
		}

		if (Object.keys(translations).length === 0) {
			continue;
		}

		await saveTranslationBundle(db, translationKey, translations);
		translationsUpdated += 1;
	}

	return { languagesUpdated, translationsUpdated };
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
