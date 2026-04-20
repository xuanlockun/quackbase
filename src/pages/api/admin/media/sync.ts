import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { syncMediaAssetsFromStorage } from "../../../../lib/media";
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
		const result = await syncMediaAssetsFromStorage(getDb(locals), locals);
		return redirect(`/admin/media?synced=1&imported=${result.imported}&updated=${result.updated}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "The media request failed.";
		return redirect(`/admin/media?errorMessage=${encodeURIComponent(message)}`);
	}
};
