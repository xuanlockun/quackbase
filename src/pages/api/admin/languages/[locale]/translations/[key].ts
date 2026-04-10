import type { APIRoute } from "astro";
import { getDb } from "../../../../../../../lib/blog";
import { updateTranslationEntry, deleteTranslationEntry } from "../../../../../../../lib/translations";
import { requireApiPermission } from "../../../../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const locale = (params.locale ?? "").trim();
	const key = params.key ?? "";
	if (!locale || !key) {
		return Response.json({ error: "Locale and key are required." }, { status: 400 });
	}

	const payload = await request.json().catch(() => ({} as Record<string, unknown>));
	const value = typeof payload.value === "string" ? payload.value.trim() : "";
	if (!value) {
		return Response.json({ error: "Translation value is required." }, { status: 400 });
	}

	try {
		const entry = await updateTranslationEntry(getDb(locals), locale, decodeURIComponent(key), value);
		return Response.json({ entry });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to update translation." },
			{ status: 400 },
		);
	}
};

export const DELETE: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const locale = (params.locale ?? "").trim();
	const key = params.key ?? "";
	if (!locale || !key) {
		return Response.json({ error: "Locale and key are required." }, { status: 400 });
	}

	try {
		await deleteTranslationEntry(getDb(locals), locale, decodeURIComponent(key));
		return new Response(null, { status: 204 });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to delete translation." },
			{ status: 400 },
		);
	}
};
