import { describe, expect, it } from "vitest";
import {
	getUiTranslations,
	readUiLanguagePreference,
	resolveUiLanguage,
	writeUiLanguagePreference,
} from "../../src/lib/i18n";

function createCookieStore(initialValue?: string) {
	let storedValue = initialValue;

	return {
		get(name: string) {
			if (name !== "edge-ui-language" || !storedValue) {
				return undefined;
			}

			return {
				value: storedValue,
				json: () => storedValue,
				number: () => Number(storedValue),
				boolean: () => storedValue === "true",
			};
		},
		set(name: string, value: string) {
			if (name === "edge-ui-language") {
				storedValue = value;
			}
		},
		read() {
			return storedValue;
		},
	};
}

describe("UI i18n integration behavior", () => {
	it("writes and reads the saved UI language preference", () => {
		const cookies = createCookieStore();
		writeUiLanguagePreference(cookies, "vi");
		expect(readUiLanguagePreference(cookies)).toBe("vi");
	});

	it("uses English fallback when a non-default dictionary key is missing", () => {
		const context = getUiTranslations({
			url: new URL("https://example.com/vi/blog/hello-world/"),
			locals: { uiLanguage: "vi" } as App.Locals,
		});

		expect(context.t("messages.pageNotFound")).toBe("Không tìm thấy trang");
		expect(context.t("messages.missingKeyForFallback", "fallback")).toBe("fallback");
	});

	it("keeps admin and frontend navigation language-aware from the same request context", () => {
		const context = getUiTranslations({
			url: new URL("https://example.com/admin/posts?lang=vi"),
			locals: { uiLanguage: "vi" } as App.Locals,
		});

		expect(context.language).toBe("vi");
		expect(context.localizeHref("/blog/hello-world/")).toBe("/vi/blog/hello-world/");
		expect(context.localizeAdminHref("/admin/pages")).toBe("/admin/pages?lang=vi");
		expect(context.switchLanguageHref("en")).toBe("/admin/posts?lang=en");
	});

	it("ignores unsupported stored preferences and returns to English", () => {
		const cookies = createCookieStore("fr");
		expect(resolveUiLanguage(new URL("https://example.com/"), readUiLanguagePreference(cookies))).toEqual({
			language: "en",
			explicitLanguage: null,
		});
	});
});
