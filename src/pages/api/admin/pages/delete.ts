import type { APIRoute } from "astro";
import { deletePage, getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["pages.delete"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/pages" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		if (typeof idValue !== "string" || idValue.trim() === "") {
			return redirect("/admin/pages?error=1");
		}

		await deletePage(getDb(locals), Number(idValue));
		return redirect("/admin/pages?deleted=1");
	} catch {
		return redirect("/admin/pages?error=1");
	}
};
