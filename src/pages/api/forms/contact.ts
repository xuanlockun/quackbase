import type { APIRoute } from "astro";
import { getDb, getSiteConfig } from "../../../lib/blog";
import { getContactFormById, listContactForms } from "../../../lib/contact-forms";
import "../../../lib/contact-form-notifications";
import { emitContactFormSubmissionHooks } from "../../../lib/contact-form-hooks";
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
		const explicitForm =
			typeof input.contactFormId === "number" ? await getContactFormById(db, input.contactFormId, input.language, catalog) : null;
		const fallbackForm = contactForms[0] ?? null;
		const selectedForm = explicitForm ?? fallbackForm;
		const fields = selectedForm?.fields ?? (await listFormFields(db));
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
		const resolvedInput = {
			...validatedInput,
			contactFormId: validatedInput.contactFormId ?? selectedForm?.id ?? 0,
		};
		const submissionId = await createFormSubmission(db, resolvedInput);

		if (selectedForm) {
			await emitContactFormSubmissionHooks({
				db,
				siteConfig,
				contactForm: selectedForm,
				submission: {
					id: submissionId,
					contactFormId: resolvedInput.contactFormId ?? selectedForm.id,
					language: resolvedInput.language,
					sourcePath: resolvedInput.sourcePath ?? null,
					values: resolvedInput.values,
					submittedAt: new Date(),
				},
				requestInfo: {
					ipAddress:
						request.headers.get("cf-connecting-ip") ||
						request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
						undefined,
					userAgent: request.headers.get("user-agent") ?? undefined,
					referer: request.headers.get("referer") ?? undefined,
				},
			});
		}

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
