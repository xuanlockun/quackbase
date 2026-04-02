import { describe, expect, it } from "vitest";
import {
	DEFAULT_LANGUAGE,
	getLanguageSwitchHref,
	getPathLanguage,
	localizeAdminHref,
	localizeHref,
	resolveUiLanguage,
	switchLang,
} from "../../src/lib/i18n";

describe("UI i18n contract helpers", () => {
	it("resolves language from prefixed routes before stored preferences", () => {
		const result = resolveUiLanguage(new URL("https://example.com/vi/blog/hello-world/"), "en");
		expect(result).toEqual({ language: "vi", explicitLanguage: "vi" });
	});

	it("falls back to the stored language and then English for unprefixed routes", () => {
		expect(resolveUiLanguage(new URL("https://example.com/blog/hello-world/"), "vi")).toEqual({
			language: "vi",
			explicitLanguage: null,
		});
		expect(resolveUiLanguage(new URL("https://example.com/blog/hello-world/"), null)).toEqual({
			language: DEFAULT_LANGUAGE,
			explicitLanguage: null,
		});
	});

	it("localizes frontend and admin hrefs without breaking route shape", () => {
		expect(localizeHref("/", "vi")).toBe("/vi/");
		expect(localizeHref("/blog/hello-world/", "vi")).toBe("/vi/blog/hello-world/");
		expect(localizeHref("/en/about/", "vi")).toBe("/vi/about/");
		expect(localizeHref("/vi/about/", "en")).toBe("/en/about/");
		expect(localizeAdminHref("/admin/posts", "vi")).toBe("/admin/posts?lang=vi");
		expect(localizeAdminHref("/admin/posts?tab=all", "en")).toBe("/admin/posts?tab=all");
	});

	it("generates language switcher hrefs for frontend and admin requests", () => {
		expect(getLanguageSwitchHref(new URL("https://example.com/vi/"), "en")).toBe("/en/");
		expect(getLanguageSwitchHref(new URL("https://example.com/vi/about/"), "en")).toBe("/en/about/");
		expect(getLanguageSwitchHref(new URL("https://example.com/admin/posts?lang=vi"), "en")).toBe("/admin/posts");
	});

	it("switches language by replacing the existing prefix instead of duplicating it", () => {
		expect(switchLang("/vi/", "en")).toBe("/en/");
		expect(switchLang("/vi/blog/hello-world/", "en")).toBe("/en/blog/hello-world/");
		expect(switchLang("/about/", "vi")).toBe("/vi/about/");
	});

	it("detects supported path languages only on the first segment", () => {
		expect(getPathLanguage("/vi/blog/hello-world/")).toBe("vi");
		expect(getPathLanguage("/admin/posts")).toBeNull();
	});
});
