import type { APIRoute } from "astro";
import { getDb, parseSiteForm, saveSiteConfig } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/header" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const input = parseSiteForm(formData);
		await saveSiteConfig(getDb(locals), input);
		return redirect("/admin/header?siteSaved=1");
	} catch {
		return redirect("/admin/header?siteError=1");
	}
};
