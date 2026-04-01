import type { APIRoute } from "astro";
import { deletePost, getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["posts.delete"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		if (typeof idValue !== "string" || idValue.trim() === "") {
			return redirect("/admin/posts?error=1");
		}

		await deletePost(getDb(locals), Number(idValue));
		return redirect("/admin/posts?deleted=1");
	} catch {
		return redirect("/admin/posts?error=1");
	}
};
