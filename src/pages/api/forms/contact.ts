import type { APIRoute } from "astro";
import { getDb, getSiteConfig } from "../../../lib/blog";
import { getContactFormById, listContactForms } from "../../../lib/contact-forms";
import {
	createFormSubmission,
	listFormFields,
	parseContactFormSubmissionForm,
	parseContactFormSubmissionPayload,
	validateContactFormSubmission,
} from "../../../lib/forms";
import { hasCaptchaConfiguration, verifyCaptchaToken } from "../../../lib/captcha";
import { getLanguageCatalog } from "../../../lib/i18n";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
	try {
		const isJsonRequest = request.headers.get("content-type")?.includes("application/json") ?? false;
		const input = isJsonRequest
			? parseContactFormSubmissionPayload(await request.json())
			: parseContactFormSubmissionForm(await request.formData());

		const db = getDb(locals);
		const catalog = getLanguageCatalog(locals);
		const siteConfig = await getSiteConfig(db);
		const contactForms = await listContactForms(db, true, input.language, catalog);
		const selectedForm =
			typeof input.contactFormId === "number" ? await getContactFormById(db, input.contactFormId, input.language, catalog) : null;
		const fields = selectedForm?.fields ?? contactForms[0]?.fields ?? (await listFormFields(db));
		if (selectedForm?.useCaptcha) {
			const captchaSettings = {
				enabled: siteConfig.captchaEnabled,
				siteKey: siteConfig.captchaSiteKey,
				secretKey: siteConfig.captchaSecretKey,
			};
			if (!hasCaptchaConfiguration(captchaSettings)) {
				throw new Error("Captcha is not configured.");
			}
			await verifyCaptchaToken(
				captchaSettings,
				input.captchaToken ?? "",
			);
		}
		const validatedInput = validateContactFormSubmission(fields, input, catalog);
		const submissionId = await createFormSubmission(db, validatedInput);

		return Response.json({
			ok: true,
			submissionId,
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to submit form." },
			{ status: 400 },
		);
	}
};
