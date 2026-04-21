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
		const parentFolderPath = String(formData.get("parentFolderPath") ?? "").trim();
		const folderName = String(formData.get("folderName") ?? "").trim();
		if (!folderName) {
			return redirect("/admin/media?errorMessage=Please enter a folder name.");
		}

		const folderPath = parentFolderPath ? `${parentFolderPath}/${folderName}` : folderName;
		await createMediaFolder(getDb(locals), folderPath);
		return redirect(`/admin/media?folderCreated=1&folder=${encodeURIComponent(folderPath)}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "The media request failed.";
		return redirect(`/admin/media?errorMessage=${encodeURIComponent(message)}`);
	}
};
