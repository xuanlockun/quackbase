import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { getLanguageByCode, updateLanguageByCode } from "../../../../lib/languages";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const code = decodeURIComponent(params.code ?? "").trim();
	if (!code) {
		return Response.json({ error: "Language code is required." }, { status: 400 });
	}

	try {
		const body = (await request.json()) as Record<string, unknown>;
		const existing = await getLanguageByCode(getDb(locals), code);
		if (!existing) {
			return Response.json({ error: "Language not found." }, { status: 404 });
		}

		const updated = await updateLanguageByCode(getDb(locals), code, {
			name: typeof body.name === "string" ? body.name : undefined,
			enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
			isDefault: typeof body.isDefault === "boolean" ? body.isDefault : undefined,
		});

		if (!updated) {
			return Response.json({ error: "Language not found." }, { status: 404 });
		}

		return Response.json({
			language: {
				id: updated.id,
				code: updated.code,
				name: updated.name,
				enabled: updated.enabled,
				isDefault: updated.isDefault,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unable to update language.";
		return Response.json({ error: message }, { status: 400 });
	}
};
