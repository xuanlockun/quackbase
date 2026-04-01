import type { APIRoute } from "astro";
import {
	createPost,
	getDb,
	parsePostForm,
	updatePost,
} from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		const requiredPermission =
			typeof idValue === "string" && idValue.trim() !== "" ? "posts.update" : "posts.create";
		const session = await requireApiPermission(
			{ locals, request, redirect },
			[requiredPermission],
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
		);
		if (session instanceof Response) {
			return session;
		}

		const db = getDb(locals);
		const input = parsePostForm(formData);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePost(db, Number(idValue), input);
			return redirect(`/admin/posts?slug=${input.slug}&saved=1`);
		}

		await createPost(db, input);
		return redirect(`/admin/posts?slug=${input.slug}&saved=1`);
	} catch {
		return redirect("/admin/posts?error=1");
	}
};
