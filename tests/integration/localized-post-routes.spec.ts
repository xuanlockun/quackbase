import { describe, expect, it } from "vitest";
import {
	findPublishedPostRecordBySlug,
	getLocalizedPostPath,
	toBlogPost,
	type BlogPostRecord,
} from "../../src/lib/blog";

describe("localized post route resolution behavior", () => {
	const rows: BlogPostRecord[] = [
		{
			id: 1,
			slug: JSON.stringify({ en: "dog" }),
			title: JSON.stringify({ en: "Dog" }),
			description: JSON.stringify({ en: "English dog" }),
			content: JSON.stringify({ en: "# Dog" }),
			hero_image: null,
			status: "published",
			pub_date: "2026-04-02T00:00:00.000Z",
			updated_date: "2026-04-02T00:00:00.000Z",
		},
		{
			id: 2,
			slug: JSON.stringify({ en: "cat", vi: "con-cho" }),
			title: JSON.stringify({ en: "Cat", vi: "Con cho" }),
			description: JSON.stringify({ en: "English cat", vi: "Mo ta viet" }),
			content: JSON.stringify({ en: "# Cat", vi: "# Con cho" }),
			hero_image: null,
			status: "published",
			pub_date: "2026-04-03T00:00:00.000Z",
			updated_date: "2026-04-03T00:00:00.000Z",
		},
	];

	it("resolves posts by the requested language slug", () => {
		expect(findPublishedPostRecordBySlug(rows, "con-cho", "vi")?.id).toBe(2);
	});

	it("falls back to the default-language slug only when the requested language slug is missing on that post", () => {
		expect(findPublishedPostRecordBySlug(rows, "dog", "vi")?.id).toBe(1);
	});

	it("prefers a direct localized slug match over another post's default-language fallback", () => {
		expect(findPublishedPostRecordBySlug(rows, "con-cho", "vi")?.id).toBe(2);
	});

	it("builds clean localized hrefs from post slug translations", () => {
		const post = toBlogPost(rows[1], "vi");
		expect(getLocalizedPostPath(post.slugTranslations, "vi")).toBe("/vi/con-cho/");
		expect(getLocalizedPostPath(post.slugTranslations, "en")).toBe("/en/cat/");
	});
});
