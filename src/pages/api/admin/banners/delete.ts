import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { deleteBanner } from "../../../../lib/banners";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["banners.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/banners" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		if (typeof idValue !== "string" || idValue.trim() === "") {
			return redirect("/admin/banners?error=1");
		}
		await deleteBanner(getDb(locals), Number(idValue));
		return redirect("/admin/banners?deleted=1");
	} catch {
		return redirect("/admin/banners?error=1");
	}
};
