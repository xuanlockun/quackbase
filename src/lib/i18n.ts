export interface SupportedLanguage {
	code: string;
	label: string;
}

export type LocalizedText = Record<string, string>;

export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
	{ code: "en", label: "English" },
	{ code: "vi", label: "Vietnamese" },
];

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
