import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { createContactForm, parseContactFormForm, updateContactForm } from "../../../lib/contact-forms";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const formData = await request.formData();
	const idValue = formData.get("id");

	try {
		const requiredPermission =
			"contactForms.manage";
		const session = await requireApiPermission(
			{ locals, request, redirect },
			[requiredPermission],
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/contact-forms" },
		);
		if (session instanceof Response) {
			return session;
		}

		const input = parseContactFormForm(formData);
		const db = getDb(locals);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updateContactForm(db, Number(idValue), input);
			return redirect("/admin/contact-forms?saved=1");
		}

		await createContactForm(db, input);
		return redirect("/admin/contact-forms?created=1");
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		if (typeof idValue === "string" && idValue.trim() !== "") {
			return redirect(`/admin/contact-forms/${idValue}/edit?error=${message}`);
		}
		return redirect(`/admin/contact-forms/new?error=${message}`);
	}
};
