import type { APIRoute } from "astro";
import {
	deleteMediaAsset,
	deleteMediaObject,
	getMediaAssetById,
	getMediaObjectResponse,
	getMediaStorageStatus,
} from "../../../../lib/media";
import { getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/media" },
	);
	if (session instanceof Response) {
		return session;
	}

	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) {
		return Response.json({ error: "Media asset not found." }, { status: 404 });
	}

	const asset = await getMediaAssetById(getDb(locals), id);
	if (!asset) {
		return Response.json({ error: "Media asset not found." }, { status: 404 });
	}

	const response = await getMediaObjectResponse(locals, asset);
	if (!response) {
		return Response.json({ error: "Media asset not available." }, { status: 404 });
	}

	return response;
};

export const POST: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/media" },
	);
	if (session instanceof Response) {
		return session;
	}

	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) {
		return redirect("/admin/media?error=1");
	}

	try {
		const formData = await request.formData();
		if (formData.get("_action") !== "delete") {
			return redirect("/admin/media?error=1");
		}

		const db = getDb(locals);
		const asset = await getMediaAssetById(db, id);
		if (!asset) {
			return redirect("/admin/media?error=1");
		}

		if ((await getMediaStorageStatus(locals)).isConfigured) {
			await deleteMediaObject(locals, asset.objectKey);
		}

		await deleteMediaAsset(db, id);
		return redirect("/admin/media?deleted=1");
	} catch {
		return redirect("/admin/media?error=1");
	}
};
