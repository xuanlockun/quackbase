import type { APIRoute } from "astro";
import { createMediaAsset, deleteMediaObject, getMediaAssetById, updateMediaAssetLocation, uploadMediaObject } from "../../../lib/media";
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
		const intent = String(formData.get("_intent") ?? "upload");
		const db = getDb(locals);

		if (intent === "bulk-delete") {
			return handleBulkDelete(locals, db, formData, redirect);
		}

		if (intent === "bulk-move") {
			return handleBulkMove(locals, db, formData, redirect);
		}

		if (intent === "update") {
			return handleUpdate(locals, db, formData, redirect);
		}

		return handleUpload(locals, db, formData, redirect);
	} catch {
		return redirect("/admin/media?errorMessage=The media request failed.");
	}
};

async function handleUpload(
	locals: App.Locals,
	db: D1Database,
	formData: FormData,
	redirect: (url: string) => Response,
): Promise<Response> {
	const folderPath = String(formData.get("folderPath") ?? "").trim();
	const files = formData
		.getAll("files")
		.filter((entry): entry is File => entry instanceof File && entry.size > 0);

	if (files.length === 0) {
		return redirect("/admin/media?errorMessage=Please choose at least one file to upload.");
	}

	let uploadedCount = 0;
	let hadFailure = false;
	let failureMessage = "";

	for (const file of files) {
		try {
			const uploaded = await uploadMediaObject(locals, file, folderPath);
			try {
				await createMediaAsset(db, {
					storageProvider: uploaded.storageProvider,
					objectKey: uploaded.objectKey,
					folderPath,
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
		} catch (error) {
			hadFailure = true;
			failureMessage = failureMessage || (error instanceof Error ? error.message : "The media request failed.");
		}
	}

	if (uploadedCount === 0) {
		return redirect(`/admin/media?errorMessage=${encodeURIComponent(failureMessage || "No files were uploaded successfully.")}`);
	}

	return redirect(
		`/admin/media?uploaded=${uploadedCount}${hadFailure ? `&errorMessage=${encodeURIComponent(failureMessage || "Some files failed to upload.")}` : ""}${folderPath ? `&folder=${encodeURIComponent(folderPath)}` : ""}`,
	);
}

async function handleUpdate(
	locals: App.Locals,
	db: D1Database,
	formData: FormData,
	redirect: (url: string) => Response,
): Promise<Response> {
	const assetId = Number(formData.get("assetId"));
	if (!Number.isInteger(assetId) || assetId <= 0) {
		return redirect("/admin/media?errorMessage=Media asset not found.");
	}

	const folderPath = formData.has("folderPath") ? String(formData.get("folderPath") ?? "") : undefined;
	const fileName = formData.has("fileName") ? String(formData.get("fileName") ?? "") : undefined;
	if (folderPath !== undefined && folderPath.trim() === "") {
		// Root is allowed, but keep it explicit for the helper.
	}
	if (fileName !== undefined && fileName.trim() === "") {
		return redirect("/admin/media?errorMessage=Please provide a file name.");
	}

	const asset = await updateMediaAssetLocation(locals, db, assetId, {
		folderPath,
		fileName,
	});
	return redirect(`/admin/media?updated=1${asset.folderPath ? `&folder=${encodeURIComponent(asset.folderPath)}` : ""}`);
}

async function handleBulkMove(
	locals: App.Locals,
	db: D1Database,
	formData: FormData,
	redirect: (url: string) => Response,
): Promise<Response> {
	const ids = parseAssetIds(formData);
	if (ids.length === 0) {
		return redirect("/admin/media?errorMessage=Please select at least one file.");
	}

	const folderPath = String(formData.get("folderPath") ?? "").trim();
	let movedCount = 0;
	for (const assetId of ids) {
		const asset = await getMediaAssetById(db, assetId);
		if (!asset) {
			continue;
		}

		await updateMediaAssetLocation(locals, db, assetId, { folderPath });
		movedCount++;
	}

	return redirect(`/admin/media?updated=${movedCount}${folderPath ? `&folder=${encodeURIComponent(folderPath)}` : ""}`);
}

async function handleBulkDelete(
	locals: App.Locals,
	db: D1Database,
	formData: FormData,
	redirect: (url: string) => Response,
): Promise<Response> {
	const ids = parseAssetIds(formData);
	if (ids.length === 0) {
		return redirect("/admin/media?errorMessage=Please select at least one file.");
	}

	const shouldDeleteObject = true;
	let deletedCount = 0;

	for (const assetId of ids) {
		const asset = await getMediaAssetById(db, assetId);
		if (!asset) {
			continue;
		}

		if (shouldDeleteObject) {
			await deleteMediaObject(locals, asset.objectKey).catch(() => void 0);
		}

		await db.prepare("DELETE FROM media_assets WHERE id = ?1").bind(assetId).run();
		deletedCount++;
	}

	const currentFolder = String(formData.get("currentFolder") ?? "").trim();
	return redirect(`/admin/media?deleted=${deletedCount}${currentFolder ? `&folder=${encodeURIComponent(currentFolder)}` : ""}`);
}

function parseAssetIds(formData: FormData): number[] {
	const rawIds = String(formData.get("assetIds") ?? "").trim();
	if (!rawIds) {
		return [];
	}

	return rawIds
		.split(",")
		.map((value) => Number(value))
		.filter((value) => Number.isInteger(value) && value > 0);
}
