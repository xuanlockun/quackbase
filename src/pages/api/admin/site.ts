import type { APIRoute } from "astro";
import { getDb, isAdminAuthenticated, parseSiteForm, saveSiteConfig } from "../../../lib/blog";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	if (!isAdminAuthenticated(request, locals)) {
		return redirect("/admin/login");
	}

	try {
		const formData = await request.formData();
		const input = parseSiteForm(formData);
		await saveSiteConfig(getDb(locals), input);
		return redirect("/admin?siteSaved=1");
	} catch {
		return redirect("/admin?siteError=1");
	}
};
