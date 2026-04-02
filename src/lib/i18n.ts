import type { AstroCookies } from "astro";
import en from "../../locales/en.json";
import vi from "../../locales/vi.json";

export interface SupportedLanguage {
	code: string;
	label: string;
}

export type LocalizedText = Record<string, string>;
interface TranslationTree {
	[key: string]: string | TranslationTree;
}

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

export const DEFAULT_LANGUAGE = "en";
export const UI_LANGUAGE_COOKIE = "edge-ui-language";
const UI_LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
	{ code: "en", label: "English" },
	{ code: "vi", label: "Vietnamese" },
];

const UI_TRANSLATIONS: Record<string, TranslationTree> = {
	en: en as TranslationTree,
	vi: vi as TranslationTree,
};

export function getSupportedLanguages(): SupportedLanguage[] {
	return [...SUPPORTED_LANGUAGES];
}

export function getDefaultLanguage(): string {
	return DEFAULT_LANGUAGE;
}

export function isSupportedLanguage(language: string): boolean {
	return SUPPORTED_LANGUAGES.some((entry) => entry.code === language);
}

export function resolveLanguage(language?: string | null): string {
	if (language && isSupportedLanguage(language)) {
		return language;
	}
	return DEFAULT_LANGUAGE;
}

export function getLocalizedPostPath(slug: string, language = DEFAULT_LANGUAGE): string {
	return `/${resolveLanguage(language)}/blog/${slug}/`;
}

export function getLocalizedPagePath(slug: string, language = DEFAULT_LANGUAGE): string {
	return `/${resolveLanguage(language)}/${slug}/`;
}

export function resolveLocalizedValue(
	translations: LocalizedText,
	requestedLanguage = DEFAULT_LANGUAGE,
): string {
	const normalizedLanguage = resolveLanguage(requestedLanguage);
	const requestedValue = translations[normalizedLanguage]?.trim();
	if (requestedValue) {
		return requestedValue;
	}

	const defaultValue = translations[DEFAULT_LANGUAGE]?.trim();
	if (defaultValue) {
		return defaultValue;
	}

	return Object.values(translations).find((value) => value.trim() !== "")?.trim() ?? "";
}

export function normalizeLocalizedText(
	input: unknown,
	options?: {
		fallbackValue?: string;
		requireDefault?: boolean;
	},
): LocalizedText {
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
			entries.push([DEFAULT_LANGUAGE, trimmed]);
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
		entries.push([DEFAULT_LANGUAGE, options.fallbackValue.trim()]);
	}

	const normalized = Object.fromEntries(entries) as LocalizedText;

	if (options?.requireDefault !== false && !normalized[DEFAULT_LANGUAGE]) {
		throw new Error(`Missing ${DEFAULT_LANGUAGE} translation.`);
	}

	return normalized;
}

export function stringifyLocalizedText(translations: LocalizedText): string {
	return JSON.stringify(sortLocalizedText(normalizeLocalizedText(translations)));
}

export function readUiLanguagePreference(cookies?: Pick<AstroCookies, "get"> | null): string | null {
	const storedValue = cookies?.get(UI_LANGUAGE_COOKIE)?.value;
	return storedValue && isSupportedLanguage(storedValue) ? storedValue : null;
}

export function writeUiLanguagePreference(
	cookies: Pick<AstroCookies, "set">,
	language: string,
): void {
	const nextLanguage = resolveLanguage(language);
	cookies.set(UI_LANGUAGE_COOKIE, nextLanguage, {
		path: "/",
		sameSite: "lax",
		httpOnly: false,
		maxAge: UI_LANGUAGE_COOKIE_MAX_AGE,
	});
}

export function getPathLanguage(pathname: string): string | null {
	const [firstSegment = ""] = pathname.split("/").filter(Boolean);
	return isSupportedLanguage(firstSegment) ? firstSegment : null;
}

export function getQueryLanguage(url: URL): string | null {
	const queryLanguage = url.searchParams.get("lang");
	return queryLanguage && isSupportedLanguage(queryLanguage) ? queryLanguage : null;
}

export function resolveUiLanguage(
	url: URL,
	storedLanguage?: string | null,
): { language: string; explicitLanguage: string | null } {
	const pathLanguage = getPathLanguage(url.pathname);
	const queryLanguage = getQueryLanguage(url);
	const explicitLanguage = pathLanguage ?? queryLanguage;
	return {
		language: resolveLanguage(explicitLanguage ?? storedLanguage ?? DEFAULT_LANGUAGE),
		explicitLanguage,
	};
}

export function getUiTranslations(context: TranslationContextInput): UiTranslations {
	const resolvedLanguage =
		context.locals?.uiLanguage ??
		resolveUiLanguage(context.url, readUiLanguagePreference(context.cookies)).language;

	return {
		language: resolvedLanguage,
		t: (key, fallback) => translateKey(key, resolvedLanguage, fallback),
		localizeHref: (href) => localizeHref(href, resolvedLanguage),
		localizeAdminHref: (href) => localizeAdminHref(href, resolvedLanguage),
		switchLanguageHref: (language) => getLanguageSwitchHref(context.url, language),
	};
}

export function localizeHref(href: string, language = DEFAULT_LANGUAGE): string {
	if (isPassthroughHref(href)) {
		return href;
	}

	const url = toInternalUrl(href);
	if (!url) {
		return href;
	}

	if (url.pathname.startsWith("/admin")) {
		return localizeAdminHref(href, language);
	}

	if (url.pathname.startsWith("/api")) {
		return formatLocalUrl(url);
	}

	url.pathname = withLanguagePrefix(url.pathname, language);
	url.searchParams.delete("lang");
	return formatLocalUrl(url);
}

export function localizeAdminHref(href: string, language = DEFAULT_LANGUAGE): string {
	if (isPassthroughHref(href)) {
		return href;
	}

	const url = toInternalUrl(href);
	if (!url) {
		return href;
	}

	if (resolveLanguage(language) === DEFAULT_LANGUAGE) {
		url.searchParams.delete("lang");
	} else {
		url.searchParams.set("lang", resolveLanguage(language));
	}

	return formatLocalUrl(url);
}

export function getLanguageSwitchHref(currentUrl: URL, language: string): string {
	const nextLanguage = resolveLanguage(language);
	if (currentUrl.pathname.startsWith("/admin")) {
		return getAdminLanguageSwitchHref(currentUrl, nextLanguage);
	}

	return switchLang(currentUrl.pathname + currentUrl.search, nextLanguage);
}

export function switchLang(href: string, language: string): string {
	return localizeHref(href, language);
}

function translateKey(key: string, language: string, fallback?: string): string {
	const value = resolveTreeValue(UI_TRANSLATIONS[resolveLanguage(language)], key);
	if (typeof value === "string" && value.trim()) {
		return value;
	}

	const defaultValue = resolveTreeValue(UI_TRANSLATIONS[DEFAULT_LANGUAGE], key);
	if (typeof defaultValue === "string" && defaultValue.trim()) {
		return defaultValue;
	}

	return fallback ?? key;
}

function resolveTreeValue(tree: TranslationTree | undefined, key: string): string | TranslationTree | undefined {
	if (!tree) {
		return undefined;
	}

	return key.split(".").reduce<string | TranslationTree | undefined>((current, segment) => {
		if (!current || typeof current === "string") {
			return undefined;
		}

		return current[segment];
	}, tree);
}

function withLanguagePrefix(pathname: string, language: string): string {
	const nextLanguage = resolveLanguage(language);
	const hasTrailingSlash = pathname === "/" || pathname.endsWith("/");
	const normalizedPath = stripLanguagePrefix(pathname);

	if (normalizedPath === "/") {
		return `/${nextLanguage}/`;
	}

	const basePath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
	return `/${nextLanguage}${basePath}${hasTrailingSlash && !basePath.endsWith("/") ? "/" : ""}`;
}

function getAdminLanguageSwitchHref(currentUrl: URL, language: string): string {
	const url = new URL(currentUrl.pathname + currentUrl.search, "https://edge-cms.local");
	url.searchParams.set("lang", resolveLanguage(language));
	return formatLocalUrl(url);
}

function stripLanguagePrefix(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return "/";
	}

	if (isSupportedLanguage(segments[0])) {
		segments.shift();
	}

	return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function sortLocalizedText(translations: LocalizedText): LocalizedText {
	const orderedCodes = [
		DEFAULT_LANGUAGE,
		...SUPPORTED_LANGUAGES.map((entry) => entry.code).filter((code) => code !== DEFAULT_LANGUAGE),
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
