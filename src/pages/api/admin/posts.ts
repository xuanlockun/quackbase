import type { APIRoute } from "astro";
import {
	createPost,
	getDb,
	isAdminAuthenticated,
	parsePostForm,
	updatePost,
} from "../../../lib/blog";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	if (!isAdminAuthenticated(request, locals)) {
		return redirect("/admin/login");
	}

	try {
		const db = getDb(locals);
		const formData = await request.formData();
		const input = parsePostForm(formData);
		const idValue = formData.get("id");

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePost(db, Number(idValue), input);
			return redirect(`/admin?slug=${input.slug}&saved=1`);
		}

		await createPost(db, input);
		return redirect(`/admin?slug=${input.slug}&saved=1`);
	} catch {
		return redirect("/admin?error=1");
	}
};
