import type { APIRoute } from "astro";
import { deletePost, getDb, isAdminAuthenticated } from "../../../../lib/blog";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	if (!isAdminAuthenticated(request, locals)) {
		return redirect("/admin/login");
	}

	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		if (typeof idValue !== "string" || idValue.trim() === "") {
			return redirect("/admin?error=1");
		}

		await deletePost(getDb(locals), Number(idValue));
		return redirect("/admin?deleted=1");
	} catch {
		return redirect("/admin?error=1");
	}
};
