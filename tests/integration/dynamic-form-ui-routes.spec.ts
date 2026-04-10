import { describe, expect, it } from "vitest";
import {
	getRenderableFormFields,
	parseContactFormSubmissionForm,
	parseFormFieldsPayload,
	validateContactFormSubmission,
} from "../../src/lib/forms";
import { getUiTranslations } from "../../src/lib/i18n";
import type { LocalizationPayload } from "../../src/lib/localization";

const englishTranslations = {
	"actions.createPost": "Create Post",
};

const vietnameseTranslations = {
	"actions.createPost": "Tạo bài viết",
};

function createPayload(locale: "en" | "vi"): LocalizationPayload {
	const translations = locale === "vi" ? vietnameseTranslations : englishTranslations;
	return {
		requestedLocale: locale,
		servedLocale: locale,
		fallbackLocale: "en",
		translations,
		fallbackTranslations: englishTranslations,
		fallbackUsed: false,
		lastUpdated: new Date(0).toISOString(),
		namespace: null,
	};
}

describe("dynamic form UI integration behavior", () => {
	it("keeps the shared language switch language-aware from the same frontend context", () => {
		const context = getUiTranslations({
			url: new URL("https://example.com/vi/contact/"),
			locals: { uiLanguage: "vi", localizationPayload: createPayload("vi") } as App.Locals,
		});

		expect(context.language).toBe("vi");
		expect(context.switchLanguageHref("en")).toBe("/en/contact/");
		expect(context.localizeHref("/about/")).toBe("/vi/about/");
	});

	it("renders dynamic fields in requested order with fallback labels", () => {
		const fields = getRenderableFormFields(
			parseFormFieldsPayload({
				fields: [
					{ type: "textarea", label: { en: "Message" }, required: true, order: 3 },
					{ type: "text", label: { en: "Name", vi: "Ten" }, required: true, order: 1 },
					{ type: "email", label: { en: "Email", vi: "Thu dien tu" }, required: true, order: 2 },
				],
			}),
			"vi",
		);

		expect(fields.map((field) => field.labelText)).toEqual(["Ten", "Thu dien tu", "Message"]);
	});

	it("parses posted field values from form data and validates required inputs", () => {
		const formData = new FormData();
		formData.set("language", "vi");
		formData.set("sourcePath", "/vi/contact/");
		formData.set("field-1", "Alex");
		formData.set("field-2", "alex@example.com");

		const submission = validateContactFormSubmission(
			[
				{ id: 1, type: "text", label: { en: "Name" }, required: true, order: 1 },
				{ id: 2, type: "email", label: { en: "Email" }, required: true, order: 2 },
			],
			parseContactFormSubmissionForm(formData),
		);

		expect(submission).toEqual({
			language: "vi",
			sourcePath: "/vi/contact/",
			values: {
				"1": "Alex",
				"2": "alex@example.com",
			},
		});
	});
});
