import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { createBanner, parseBannerForm, updateBanner } from "../../../lib/banners";
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
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/banners" },
		);
		if (session instanceof Response) {
			return session;
		}

		const input = parseBannerForm(formData);
		const db = getDb(locals);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updateBanner(db, Number(idValue), input);
			return redirect("/admin/banners?saved=1");
		}

		await createBanner(db, input);
		return redirect("/admin/banners?created=1");
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		if (typeof idValue === "string" && idValue.trim() !== "") {
			return redirect(`/admin/banners/${idValue}/edit?error=${message}`);
		}
		return redirect(`/admin/banners/new?error=${message}`);
	}
};
