import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { listFormFields, parseFormFieldsPayload, saveFormFields } from "../../../lib/forms";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["contactForms.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/contact-forms", forceJson: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const fields = await listFormFields(getDb(locals));
	return Response.json({ fields });
};

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["contactForms.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/contact-forms", forceJson: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const payload = await request.json();
		const fields = parseFormFieldsPayload(payload, "fields");
		const savedFields = await saveFormFields(getDb(locals), fields);
		return Response.json({ fields: savedFields });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to save form fields." },
			{ status: 400 },
		);
	}
};
