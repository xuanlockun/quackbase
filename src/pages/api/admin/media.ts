import type { APIRoute } from "astro";
import { createMediaAsset, deleteMediaObject, uploadMediaObject } from "../../../lib/media";
import { getDb } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

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
		const files = formData
			.getAll("files")
			.filter((entry): entry is File => entry instanceof File && entry.size > 0);

		if (files.length === 0) {
			return redirect("/admin/media?errorMessage=Please choose at least one file to upload.");
		}

		const db = getDb(locals);
		let uploadedCount = 0;
		let hadFailure = false;

		for (const file of files) {
			try {
				const uploaded = await uploadMediaObject(locals, file);
				try {
					await createMediaAsset(db, {
						storageProvider: uploaded.storageProvider,
						objectKey: uploaded.objectKey,
						fileName: file.name || uploaded.objectKey.split("/").pop() || "upload",
						mimeType: file.type || "application/octet-stream",
						sizeBytes: file.size,
						publicUrl: uploaded.publicUrl,
					});
					uploadedCount++;
				} catch (error) {
					await deleteMediaObject(locals, uploaded.objectKey).catch(() => void 0);
					throw error;
				}
			} catch {
				hadFailure = true;
			}
		}

		if (uploadedCount === 0) {
			return redirect("/admin/media?errorMessage=No files were uploaded successfully.");
		}

		return redirect(
			`/admin/media?uploaded=${uploadedCount}${hadFailure ? "&errorMessage=Some files failed to upload." : ""}`,
		);
	} catch {
		return redirect("/admin/media?errorMessage=The media request failed.");
	}
};
