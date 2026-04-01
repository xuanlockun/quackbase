import type { APIRoute } from "astro";
import {
	createPage,
	getDb,
	parsePageForm,
	updatePage,
} from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	try {
		const formData = await request.formData();
		const idValue = formData.get("id");
		const requiredPermission =
			typeof idValue === "string" && idValue.trim() !== "" ? "pages.update" : "pages.create";
		const session = await requireApiPermission(
			{ locals, request, redirect },
			[requiredPermission],
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/pages" },
		);
		if (session instanceof Response) {
			return session;
		}

		const input = parsePageForm(formData);

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
