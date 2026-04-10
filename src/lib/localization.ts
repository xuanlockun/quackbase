import { getDefaultLanguageCode } from "./languages";

const CACHE_TTL_MS = 30_000;

interface LocaleLoadResult {
	translations: Record<string, string>;
	lastUpdated: string | null;
	entryCount: number;
	namespace: string | null;
}

interface CacheEntry {
	translations: Record<string, string>;
	lastUpdated: string | null;
	entryCount: number;
	namespace: string | null;
	fetchedAt: number;
}

const localeCache = new Map<string, CacheEntry>();

function cacheKey(locale: string, namespace: string | null): string {
	return `${locale}::${namespace ?? ""}`;
}

function shouldUseCache(entry: CacheEntry): boolean {
	return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

async function loadLocaleTranslations(
	db: D1Database,
	locale: string,
	namespace?: string,
): Promise<LocaleLoadResult> {
	const normalizedLocale = locale.trim().toLowerCase();
	if (!normalizedLocale) {
		return { translations: {}, lastUpdated: null, entryCount: 0, namespace: namespace?.trim() ?? null };
	}

	const namespaceKey = namespace?.trim() ?? null;
	const key = cacheKey(normalizedLocale, namespaceKey);
	const cached = localeCache.get(key);
	if (cached && shouldUseCache(cached)) {
		return {
			translations: cached.translations,
			lastUpdated: cached.lastUpdated,
			entryCount: cached.entryCount,
			namespace: cached.namespace,
		};
	}

	let query = "SELECT translation_key, translated_value, updated_at FROM translation_entries WHERE locale_code = ?1";
	const bindings: unknown[] = [normalizedLocale];
	if (namespaceKey) {
		query += " AND (translation_key = ?2 OR translation_key LIKE ?2 || '.%')";
		bindings.push(namespaceKey);
	}
	query += " ORDER BY translation_key ASC";

	const result = await db.prepare(query).bind(...bindings).all<{
		translation_key: string;
		translated_value: string;
		updated_at: string;
	}>();

	const rows = result.results ?? [];
	const translations: Record<string, string> = {};
	let lastUpdatedMillis = -1;

	for (const row of rows) {
		const value = row.translated_value?.trim();
		if (value) {
			translations[row.translation_key] = value;
		}

		if (row.updated_at) {
			const parsed = Date.parse(row.updated_at);
			if (!Number.isNaN(parsed) && parsed > lastUpdatedMillis) {
				lastUpdatedMillis = parsed;
			}
		}
	}

	const lastUpdated = lastUpdatedMillis >= 0 ? new Date(lastUpdatedMillis).toISOString() : null;
	const entryCount = Object.keys(translations).length;

	const entry: CacheEntry = {
		translations,
		lastUpdated,
		entryCount,
		namespace: namespaceKey,
		fetchedAt: Date.now(),
	};
	localeCache.set(key, entry);

	return {
		translations,
		lastUpdated,
		entryCount,
		namespace: namespaceKey,
	};
}

export interface LocalizationPayload {
	requestedLocale: string;
	servedLocale: string;
	fallbackLocale: string;
	translations: Record<string, string>;
	fallbackTranslations: Record<string, string>;
	fallbackUsed: boolean;
	lastUpdated: string | null;
	namespace: string | null;
}

export async function loadLocalizationPayload(
	db: D1Database,
	locale: string,
	namespace?: string,
): Promise<LocalizationPayload> {
	const fallbackLocale = await getDefaultLanguageCode(db);
	const primaryLocale = locale.trim() || fallbackLocale;
	const primaryPromise = loadLocaleTranslations(db, primaryLocale, namespace);
	const fallbackPromise =
		primaryLocale === fallbackLocale ? primaryPromise : loadLocaleTranslations(db, fallbackLocale, namespace);
	const [primary, fallback] = await Promise.all([primaryPromise, fallbackPromise]);

	const fallbackTranslations = fallback?.translations ?? {};
	const primaryHasEntries = (primary?.entryCount ?? 0) > 0;
	const servedLocale = primaryHasEntries ? primaryLocale : fallbackLocale;
	const translations = primaryHasEntries ? primary?.translations ?? {} : fallbackTranslations;
	const lastUpdated = primary?.lastUpdated ?? fallback?.lastUpdated ?? null;

	return {
		requestedLocale: primaryLocale,
		servedLocale,
		fallbackLocale,
		translations,
		fallbackTranslations,
		fallbackUsed: !primaryHasEntries,
		lastUpdated,
		namespace: namespace?.trim() ?? null,
	};
}

export function invalidateLocalizationCache(locale?: string, namespace?: string): void {
	if (locale) {
		const namespaceKey = namespace?.trim() ?? "";
		localeCache.delete(cacheKey(locale.trim().toLowerCase(), namespaceKey || null));
		return;
	}
	localeCache.clear();
}

export function clearLocalizationCache(): void {
	localeCache.clear();
}
