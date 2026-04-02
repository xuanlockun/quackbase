import { describe, expect, it } from "vitest";
import {
	getContactFieldInputName,
	getRenderableFormFields,
	parseContactFormSubmissionPayload,
	parseFormFieldsPayload,
	validateContactFormSubmission,
} from "../../src/lib/forms";
import { getLanguageSwitchOptions } from "../../src/lib/i18n";

describe("dynamic form UI contract helpers", () => {
	it("parses multilingual admin field payloads into normalized ordered fields", () => {
		const fields = parseFormFieldsPayload({
			fields: [
				{
					type: "email",
					label: { en: "Email", vi: "Email" },
					required: true,
					order: 2,
				},
				{
					type: "text",
					label: { en: "Name", vi: "Ten" },
					required: true,
					order: 1,
				},
			],
		});

		expect(fields).toEqual([
			{ id: 2, type: "text", label: { en: "Name", vi: "Ten" }, required: true, order: 1 },
			{ id: 1, type: "email", label: { en: "Email", vi: "Email" }, required: true, order: 2 },
		]);
	});

	it("builds shared language switch targets for frontend and admin contexts", () => {
		expect(getLanguageSwitchOptions(new URL("https://example.com/vi/about/"), "vi")).toEqual([
			{ code: "en", label: "English", href: "/en/about/", isActive: false },
			{ code: "vi", label: "Vietnamese", href: "/vi/about/", isActive: true },
		]);
		expect(getLanguageSwitchOptions(new URL("https://example.com/admin/pages?lang=vi"), "vi")[0]?.href).toBe(
			"/admin/pages?lang=en",
		);
	});

	it("resolves renderable field labels with English fallback and stable input names", () => {
		const fields = getRenderableFormFields(
			[
				{ id: 7, type: "textarea", label: { en: "Message" }, required: true, order: 1 },
			],
			"vi",
		);

		expect(fields[0]).toMatchObject({
			inputName: getContactFieldInputName(7),
			labelText: "Message",
		});
	});

	it("accepts configured submission values and rejects invalid email fields", () => {
		const submission = validateContactFormSubmission(
			[
				{ id: 1, type: "text", label: { en: "Name" }, required: true, order: 1 },
				{ id: 2, type: "email", label: { en: "Email" }, required: true, order: 2 },
			],
			parseContactFormSubmissionPayload({
				language: "vi",
				values: {
					"1": "Alex",
					"2": "alex@example.com",
					"3": "ignored",
				},
			}),
		);

		expect(submission).toEqual({
			language: "vi",
			sourcePath: undefined,
			values: {
				"1": "Alex",
				"2": "alex@example.com",
			},
		});

		expect(() =>
			validateContactFormSubmission(
				[{ id: 2, type: "email", label: { en: "Email" }, required: true, order: 1 }],
				parseContactFormSubmissionPayload({ language: "en", values: { "2": "not-an-email" } }),
			),
		).toThrow("Invalid email field: 2");
	});
});
