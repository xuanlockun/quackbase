import type { APIRoute } from "astro";
import {
	createPage,
	getDb,
	isAdminAuthenticated,
	parsePageForm,
	updatePage,
} from "../../../lib/blog";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	if (!isAdminAuthenticated(request, locals)) {
		return redirect("/admin/login");
	}

	try {
		const formData = await request.formData();
		const input = parsePageForm(formData);
		const idValue = formData.get("id");

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePage(getDb(locals), Number(idValue), input);
			return redirect(`/admin/pages?slug=${input.slug}&pageSaved=1`);
		}

		await createPage(getDb(locals), input);
		return redirect(`/admin/pages?slug=${input.slug}&pageSaved=1`);
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		return redirect(`/admin/pages?pageError=${message}`);
	}
};
