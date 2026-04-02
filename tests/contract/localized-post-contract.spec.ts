import { describe, expect, it } from "vitest";
import {
	normalizeLocalizedSlugMap,
	parsePostPayload,
	toAdminPostSummary,
	toBlogPost,
} from "../../src/lib/blog";

describe("localized post contract helpers", () => {
	it("slugifies localized slug payloads and keeps localized description payloads", () => {
		const input = parsePostPayload({
			slug: { en: "Hello World", vi: "Con chó" },
			title: { en: "Hello World", vi: "Xin chào" },
			description: { en: "English summary", vi: "Mô tả tiếng Việt" },
			content: { en: "# Hello", vi: "# Xin chào" },
			status: "published",
		});

		expect(input.slugTranslations).toEqual({ en: "hello-world", vi: "con-cho" });
		expect(input.descriptionTranslations.vi).toBe("Mô tả tiếng Việt");
	});

	it("builds admin post summaries with clean localized post hrefs", () => {
		const post = toBlogPost({
			id: 42,
			slug: JSON.stringify({ en: "dog", vi: "con-cho" }),
			title: JSON.stringify({ en: "Dog", vi: "Con cho" }),
			description: JSON.stringify({ en: "English summary", vi: "Tom tat" }),
			content: JSON.stringify({ en: "# Dog", vi: "# Con cho" }),
			hero_image: null,
			status: "published",
			pub_date: "2026-04-02T00:00:00.000Z",
			updated_date: "2026-04-02T01:00:00.000Z",
		}, "vi");

		expect(toAdminPostSummary(post, "vi")).toMatchObject({
			slug: "con-cho",
			description: "Tom tat",
			viewHref: "/vi/con-cho/",
		});
	});

	it("normalizes legacy and accented localized slug values into URL-safe forms", () => {
		expect(normalizeLocalizedSlugMap({ en: "Dog", vi: "Con chó" })).toEqual({
			en: "dog",
			vi: "con-cho",
		});
	});
});
