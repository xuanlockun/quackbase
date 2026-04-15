import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { deleteContactForm } from "../../../../lib/contact-forms";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["contactForms.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/contact-forms" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		if (typeof idValue !== "string" || idValue.trim() === "") {
			return redirect("/admin/contact-forms?error=1");
		}
		await deleteContactForm(getDb(locals), Number(idValue));
		return redirect("/admin/contact-forms?deleted=1");
	} catch {
		return redirect("/admin/contact-forms?error=1");
	}
};
