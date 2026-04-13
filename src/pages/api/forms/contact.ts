import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { getContactFormById, listContactForms } from "../../../lib/contact-forms";
import {
	createFormSubmission,
	listFormFields,
	parseContactFormSubmissionForm,
	parseContactFormSubmissionPayload,
	validateContactFormSubmission,
} from "../../../lib/forms";
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
		const contactForms = await listContactForms(db, true);
		const selectedForm =
			typeof input.contactFormId === "number" ? await getContactFormById(db, input.contactFormId) : null;
		const fields = selectedForm?.fields ?? contactForms[0]?.fields ?? (await listFormFields(db));
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
