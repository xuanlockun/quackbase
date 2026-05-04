import type { APIRoute } from "astro";
import { getDb } from "../../../../../lib/blog";
import { buildTranslationExportPayload } from "../../../../../lib/translations";
import { requireApiPermission } from "../../../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const payload = await buildTranslationExportPayload(getDb(locals));
		const timestamp = payload.exportedAt.replace(/[:.]/g, "-");
		return new Response(JSON.stringify(payload, null, 2), {
			status: 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"content-disposition": `attachment; filename="edge-cms-languages-${timestamp}.json"`,
			},
		});
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to export translations." },
			{ status: 500 },
		);
	}
};
