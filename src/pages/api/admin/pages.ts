import type { APIRoute } from "astro";
import { createPage, getDb, parsePageForm, updatePage } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const formData = await request.formData();
	const idValue = formData.get("id");

	try {
		const requiredPermission =
			typeof idValue === "string" && idValue.trim() !== "" ? "pages.update" : "pages.create";
		const session = await requireApiPermission(
			{ locals, request, redirect },
			[requiredPermission],
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/pages" },
		);
		if (session instanceof Response) {
			return session;
		}

		const input = parsePageForm(formData);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePage(getDb(locals), Number(idValue), input);
			return redirect("/admin/pages?saved=1");
		}

		await createPage(getDb(locals), input);
		return redirect("/admin/pages?created=1");
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		if (typeof idValue === "string" && idValue.trim() !== "") {
			return redirect(`/admin/pages/${idValue}/edit?error=${message}`);
		}
		return redirect(`/admin/pages/new?error=${message}`);
	}
};
