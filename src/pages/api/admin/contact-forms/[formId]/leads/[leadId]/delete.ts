import type { APIRoute } from "astro";
import { getDb } from "../../../../../../../lib/blog";
import { deleteFormSubmission } from "../../../../../../../lib/forms";
import { requireApiPermission } from "../../../../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["contactForms.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/contact-forms" },
	);
	if (session instanceof Response) {
		return session;
	}

	const formId = Number(params.formId);
	const leadId = Number(params.leadId);
	if (!Number.isInteger(formId) || formId <= 0 || !Number.isInteger(leadId) || leadId <= 0) {
		return redirect("/admin/contact-forms?error=1");
	}

	try {
		await deleteFormSubmission(getDb(locals), formId, leadId);
		return redirect(`/admin/contact-forms/${formId}/leads?deleted=1`);
	} catch {
		return redirect(`/admin/contact-forms/${formId}/leads?error=1`);
	}
};
