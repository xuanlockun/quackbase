import type { AstroCookies } from "astro";
import {
	FALLBACK_LANGUAGE_CATALOG,
	type LanguageCatalogState,
} from "./languages";

export interface SupportedLanguage {
	code: string;
	label: string;
}

export type LocalizedText = Record<string, string>;
interface TranslationContextInput {
	url: URL;
	locals?: App.Locals;
	cookies?: AstroCookies;
}

export interface UiTranslations {
	language: string;
	t: (key: string, fallback?: string) => string;
	localizeHref: (href: string) => string;
	localizeAdminHref: (href: string) => string;
	switchLanguageHref: (language: string) => string;
}

export interface LanguageSwitchOption {
	code: string;
	label: string;
	href: string;
	isActive: boolean;
}

export const DEFAULT_LANGUAGE = "en";
export const UI_LANGUAGE_COOKIE = "edge-ui-language";
const UI_LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getLanguageCatalog(locals?: App.Locals | null): LanguageCatalogState {
	return locals?.languageCatalog ?? FALLBACK_LANGUAGE_CATALOG;
}

export function getSupportedLanguages(catalog?: LanguageCatalogState): SupportedLanguage[] {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	return c.enabledLanguages.map((entry) => ({ code: entry.code, label: entry.label }));
}

export function getDefaultLanguage(catalog?: LanguageCatalogState): string {
	return catalog?.defaultLanguageCode ?? FALLBACK_LANGUAGE_CATALOG.defaultLanguageCode;
}

export function isSupportedLanguage(language: string, catalog?: LanguageCatalogState): boolean {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	return c.enabledLanguages.some((entry) => entry.code === language);
}

export function resolveLanguage(language?: string | null, catalog?: LanguageCatalogState): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	if (language && isSupportedLanguage(language, c)) {
		return language;
	}
	return c.defaultLanguageCode;
}

export function getLocalizedPostPath(
	slug: string | LocalizedText,
	language: string | undefined,
	catalog?: LanguageCatalogState,
): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const resolvedSlug =
		typeof slug === "string"
			? slug.trim()
			: resolveLocalizedValue(
					normalizeLocalizedText(slug, {
						requireDefault: true,
						defaultLanguageCode: c.defaultLanguageCode,
					}),
					language,
					c,
				);
	return `/${resolveLanguage(language, c)}/${resolvedSlug}/`;
}

export function getLocalizedPagePath(slug: string, language: string | undefined, catalog?: LanguageCatalogState): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	return `/${resolveLanguage(language, c)}/${slug}/`;
}

export function resolveLocalizedValue(
	translations: LocalizedText,
	requestedLanguage: string | undefined,
	catalog?: LanguageCatalogState,
): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const normalizedLanguage = resolveLanguage(requestedLanguage, c);
	const requestedValue = translations[normalizedLanguage]?.trim();
	if (requestedValue) {
		return requestedValue;
	}

	const defaultValue = translations[c.defaultLanguageCode]?.trim();
	if (defaultValue) {
		return defaultValue;
	}

	return Object.values(translations).find((value) => value.trim() !== "")?.trim() ?? "";
}

export function resolveLocalizedLabel(
	translations: LocalizedText | string,
	requestedLanguage: string | undefined,
	catalog?: LanguageCatalogState,
): string {
	return resolveLocalizedValue(
		typeof translations === "string"
			? normalizeLocalizedText(translations, { defaultLanguageCode: (catalog ?? FALLBACK_LANGUAGE_CATALOG).defaultLanguageCode })
			: translations,
		requestedLanguage,
		catalog,
	);
}

export function normalizeLocalizedText(
	input: unknown,
	options?: {
		fallbackValue?: string;
		requireDefault?: boolean;
		/** Catalog default language key for required JSON fields (defaults to legacy `en`). */
		defaultLanguageCode?: string;
	},
): LocalizedText {
	const defaultCode = options?.defaultLanguageCode ?? DEFAULT_LANGUAGE;
	const entries: [string, string][] = [];

	if (typeof input === "string") {
		const trimmed = input.trim();
		if (trimmed.startsWith("{")) {
			try {
				return normalizeLocalizedText(JSON.parse(trimmed), options);
			} catch {
				// Fall through and treat the input as legacy plain text.
			}
		}

		if (trimmed) {
			entries.push([defaultCode, trimmed]);
		}
	} else if (input && typeof input === "object" && !Array.isArray(input)) {
		for (const [key, value] of Object.entries(input)) {
			if (!isLanguageCode(key) || typeof value !== "string") {
				continue;
			}

			const trimmed = value.trim();
			if (trimmed) {
				entries.push([key, trimmed]);
			}
		}
	}

	if (entries.length === 0 && options?.fallbackValue?.trim()) {
		entries.push([defaultCode, options.fallbackValue.trim()]);
	}

	const normalized = Object.fromEntries(entries) as LocalizedText;

	if (options?.requireDefault !== false && !normalized[defaultCode]) {
		throw new Error(`Missing ${defaultCode} translation.`);
	}

	return normalized;
}

export function stringifyLocalizedText(
	translations: LocalizedText,
	catalog?: LanguageCatalogState,
): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	return JSON.stringify(
		sortLocalizedText(
			normalizeLocalizedText(translations, { defaultLanguageCode: c.defaultLanguageCode }),
			c,
		),
	);
}

export function readUiLanguagePreference(
	cookies?: Pick<AstroCookies, "get"> | null,
	catalog?: LanguageCatalogState,
): string | null {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const storedValue = cookies?.get(UI_LANGUAGE_COOKIE)?.value;
	return storedValue && isSupportedLanguage(storedValue, c) ? storedValue : null;
}

export function writeUiLanguagePreference(
	cookies: Pick<AstroCookies, "set">,
	language: string,
	catalog?: LanguageCatalogState,
): void {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const nextLanguage = resolveLanguage(language, c);
	cookies.set(UI_LANGUAGE_COOKIE, nextLanguage, {
		path: "/",
		sameSite: "lax",
		httpOnly: false,
		maxAge: UI_LANGUAGE_COOKIE_MAX_AGE,
	});
}

export function getPathLanguage(pathname: string, catalog?: LanguageCatalogState): string | null {
	const [firstSegment = ""] = pathname.split("/").filter(Boolean);
	return isSupportedLanguage(firstSegment, catalog) ? firstSegment : null;
}

export function getQueryLanguage(url: URL, catalog?: LanguageCatalogState): string | null {
	const queryLanguage = url.searchParams.get("lang");
	return queryLanguage && isSupportedLanguage(queryLanguage, catalog) ? queryLanguage : null;
}

export function resolveUiLanguage(
	url: URL,
	storedLanguage?: string | null,
	catalog?: LanguageCatalogState,
): { language: string; explicitLanguage: string | null } {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const pathLanguage = getPathLanguage(url.pathname, c);
	const queryLanguage = getQueryLanguage(url, c);
	const explicitLanguage = pathLanguage ?? queryLanguage;
	return {
		language: resolveLanguage(explicitLanguage ?? storedLanguage ?? c.defaultLanguageCode, c),
		explicitLanguage,
	};
}

export function getUiTranslations(context: TranslationContextInput): UiTranslations {
	const catalog = getLanguageCatalog(context.locals);
	const resolvedLanguage =
		context.locals?.uiLanguage ??
		resolveUiLanguage(context.url, readUiLanguagePreference(context.cookies, catalog), catalog).language;
	const payload = context.locals?.localizationPayload;
	const translations = payload?.translations ?? {};
	const fallbackTranslations = payload?.fallbackTranslations ?? {};

	return {
		language: resolvedLanguage,
		t: (key, fallback) => translateKey(key, translations, fallbackTranslations, fallback),
		localizeHref: (href) => localizeHref(href, resolvedLanguage, catalog),
		localizeAdminHref: (href) => localizeAdminHref(href, resolvedLanguage, catalog),
		switchLanguageHref: (language) => getLanguageSwitchHref(context.url, language, catalog),
	};
}

export function localizeHref(href: string, language: string | undefined, catalog?: LanguageCatalogState): string {
	if (isPassthroughHref(href)) {
		return href;
	}

	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const url = toInternalUrl(href);
	if (!url) {
		return href;
	}

	if (url.pathname.startsWith("/admin")) {
		return localizeAdminHref(href, language, c);
	}

	if (url.pathname.startsWith("/api")) {
		return formatLocalUrl(url);
	}

	url.pathname = withLanguagePrefix(url.pathname, language, c);
	url.searchParams.delete("lang");
	return formatLocalUrl(url);
}

export function localizeAdminHref(href: string, language: string | undefined, catalog?: LanguageCatalogState): string {
	if (isPassthroughHref(href)) {
		return href;
	}

	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const url = toInternalUrl(href);
	if (!url) {
		return href;
	}

	if (resolveLanguage(language, c) === c.defaultLanguageCode) {
		url.searchParams.delete("lang");
	} else {
		url.searchParams.set("lang", resolveLanguage(language, c));
	}

	return formatLocalUrl(url);
}

export function getLanguageSwitchHref(
	currentUrl: URL,
	language: string,
	catalog?: LanguageCatalogState,
): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const nextLanguage = resolveLanguage(language, c);
	if (currentUrl.pathname.startsWith("/admin")) {
		return getAdminLanguageSwitchHref(currentUrl, nextLanguage, c);
	}

	return switchLang(`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`, nextLanguage, c);
}

export function switchLang(href: string, language: string, catalog?: LanguageCatalogState): string {
	const c = catalog ?? FALLBACK_LANGUAGE_CATALOG;
	const url = toInternalUrl(href);
	if (!url) {
		return href;
	}

	const normalizedPath = stripLanguagePrefix(url.pathname, c);
	const needsTrailingSlash = url.pathname !== "/" && url.pathname.endsWith("/") && normalizedPath !== "/";
	const pathWithSuffix = needsTrailingSlash ? `${normalizedPath}/` : normalizedPath;
	url.pathname = withLanguagePrefix(pathWithSuffix, language, c);
	url.searchParams.delete("lang");
	return formatLocalUrl(url);
}

export function getLanguageSwitchOptions(
	currentUrl: URL,
	activeLanguage: string,
	catalog: LanguageCatalogState = FALLBACK_LANGUAGE_CATALOG,
): LanguageSwitchOption[] {
	const c = catalog;
	const resolvedLanguage = resolveLanguage(activeLanguage, c);
	return c.enabledLanguages.map((entry) => ({
		code: entry.code,
		label: entry.label,
		href: getLanguageSwitchHref(currentUrl, entry.code, c),
		isActive: entry.code === resolvedLanguage,
	}));
}

function translateKey(
	key: string,
	translations: Record<string, string>,
	fallbackTranslations: Record<string, string>,
	fallback?: string,
): string {
	const value = translations[key];
	if (typeof value === "string" && value.trim()) {
		return value;
	}

	const defaultValue = fallbackTranslations[key];
	if (typeof defaultValue === "string" && defaultValue.trim()) {
		return defaultValue;
	}

	return fallback ?? key;
}

function withLanguagePrefix(pathname: string, language: string | undefined, catalog: LanguageCatalogState): string {
	const nextLanguage = resolveLanguage(language, catalog);
	const hasTrailingSlash = pathname === "/" || pathname.endsWith("/");
	const normalizedPath = stripLanguagePrefix(pathname, catalog);

	if (normalizedPath === "/") {
		return `/${nextLanguage}/`;
	}

	const basePath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
	return `/${nextLanguage}${basePath}${hasTrailingSlash && !basePath.endsWith("/") ? "/" : ""}`;
}

function getAdminLanguageSwitchHref(currentUrl: URL, language: string, catalog: LanguageCatalogState): string {
	const url = new URL(currentUrl.pathname + currentUrl.search, "https://edge-cms.local");
	url.searchParams.set("lang", resolveLanguage(language, catalog));
	return formatLocalUrl(url);
}

function stripLanguagePrefix(pathname: string, catalog: LanguageCatalogState): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return "/";
	}

	if (isSupportedLanguage(segments[0], catalog)) {
		segments.shift();
	}

	return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function sortLocalizedText(translations: LocalizedText, catalog: LanguageCatalogState): LocalizedText {
	const orderedCodes = [
		catalog.defaultLanguageCode,
		...catalog.enabledLanguages.map((e) => e.code).filter((code) => code !== catalog.defaultLanguageCode),
		...Object.keys(translations).sort(),
	];

	const sorted: LocalizedText = {};
	for (const code of orderedCodes) {
		const value = translations[code];
		if (value?.trim()) {
			sorted[code] = value.trim();
		}
	}

	return sorted;
}

function isLanguageCode(value: string): boolean {
	return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(value);
}

function toInternalUrl(href: string): URL | null {
	try {
		return new URL(href, "https://edge-cms.local");
	} catch {
		return null;
	}
}

function formatLocalUrl(url: URL): string {
	return `${url.pathname}${url.search}${url.hash}`;
}

function isPassthroughHref(href: string): boolean {
	return (
		!href ||
		href.startsWith("#") ||
		href.startsWith("mailto:") ||
		href.startsWith("tel:") ||
		href.startsWith("javascript:")
	);
}
