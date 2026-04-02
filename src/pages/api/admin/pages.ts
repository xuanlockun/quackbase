import type { APIRoute } from "astro";
import { createPage, getDb, parsePageForm, parsePagePayload, updatePage } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const isJsonRequest = request.headers.get("content-type")?.includes("application/json") ?? false;
	const formData = isJsonRequest ? null : await request.formData();
	const payload = isJsonRequest ? await request.json() : null;
	const idValue = formData?.get("id");

	try {
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

		const input = isJsonRequest ? parsePagePayload(payload) : parsePageForm(formData as FormData);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePage(getDb(locals), Number(idValue), input);
			if (isJsonRequest) {
				return Response.json({
					pageId: Number(idValue),
					redirectTo: "/admin/pages?saved=1",
					message: "Page saved.",
				});
			}
			return redirect("/admin/pages?saved=1");
		}

		const pageId = await createPage(getDb(locals), input);
		if (isJsonRequest) {
			return Response.json({
				pageId,
				redirectTo: "/admin/pages?created=1",
				message: "Page created.",
			}, { status: 201 });
		}
		return redirect("/admin/pages?created=1");
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		if (typeof idValue === "string" && idValue.trim() !== "") {
			return redirect(`/admin/pages/${idValue}/edit?error=${message}`);
		}
		return redirect(`/admin/pages/new?error=${message}`);
	}
};
