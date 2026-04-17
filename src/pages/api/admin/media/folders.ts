import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { createMediaFolder } from "../../../../lib/media";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/media" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const folderPath = String(formData.get("folderPath") ?? "").trim();
		await createMediaFolder(getDb(locals), folderPath);
		return redirect(`/admin/media?folderCreated=1&folder=${encodeURIComponent(folderPath)}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "The media request failed.";
		return redirect(`/admin/media?errorMessage=${encodeURIComponent(message)}`);
	}
};
