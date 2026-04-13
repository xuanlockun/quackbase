import type { APIRoute } from "astro";
import { getDb } from "../../../../../../lib/blog";
import {
	deleteTranslationEntry,
	listTranslationEntriesByKey,
	saveTranslationBundle,
	updateTranslationEntry,
} from "../../../../../../lib/translations";
import { requireApiPermission } from "../../../../../../lib/rbac/guards";

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
	const translations = parseTranslations(payload.translations);
	const value = typeof payload.value === "string" ? payload.value.trim() : "";

	try {
		if (translations) {
			const entry = await saveTranslationBundle(getDb(locals), decodeURIComponent(key), translations);
			return Response.json({ entry });
		}

		if (!value) {
			return Response.json({ error: "Translation value is required." }, { status: 400 });
		}

		const entry = await updateTranslationEntry(getDb(locals), locale, decodeURIComponent(key), value);
		return Response.json({ entry });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to update translation." },
			{ status: 400 },
		);
	}
};

export const GET: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const key = decodeURIComponent(params.key ?? "").trim();
	if (!key) {
		return Response.json({ error: "Translation key is required." }, { status: 400 });
	}

	try {
		const entry = await listTranslationEntriesByKey(getDb(locals), key);
		if (!entry) {
			return Response.json({ error: "Translation entry not found." }, { status: 404 });
		}
		return Response.json({ entry });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to load translation." },
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

function parseTranslations(value: unknown): Record<string, string> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const translations: Record<string, string> = {};
	for (const [locale, translatedValue] of Object.entries(value as Record<string, unknown>)) {
		if (typeof translatedValue !== "string") {
			continue;
		}
		translations[locale] = translatedValue;
	}

	return Object.keys(translations).length > 0 ? translations : null;
}
