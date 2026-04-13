import type { APIRoute } from "astro";
import { getDb } from "../../../../../../lib/blog";
import {
	listTranslationEntriesByLocale,
	insertTranslationEntry,
	saveTranslationBundle,
} from "../../../../../../lib/translations";
import { requireApiPermission } from "../../../../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const locale = (params.locale ?? "").trim();
	if (!locale) {
		return Response.json({ error: "Locale is required." }, { status: 400 });
	}

	try {
		const entries = await listTranslationEntriesByLocale(getDb(locals), locale);
		return Response.json({ entries });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to load translations." },
			{ status: 500 },
		);
	}
};

export const POST: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const locale = (params.locale ?? "").trim();
	if (!locale) {
		return Response.json({ error: "Locale is required." }, { status: 400 });
	}

	const payload = await parsePayload(request);
	const translationKey = typeof payload.key === "string" ? payload.key.trim() : "";
	const translatedValue = typeof payload.value === "string" ? payload.value.trim() : "";
	const translations = parseTranslations(payload.translations);

	if (!translationKey) {
		return Response.json({ error: "Translation key is required." }, { status: 400 });
	}

	if (translations) {
		try {
			const entry = await saveTranslationBundle(getDb(locals), translationKey, translations);
			return Response.json({ entry }, { status: 201 });
		} catch (error) {
			return Response.json(
				{ error: error instanceof Error ? error.message : "Unable to create translation." },
				{ status: 400 },
			);
		}
	}

	if (!translatedValue) {
		return Response.json({ error: "Translation value is required." }, { status: 400 });
	}

	try {
		const entry = await insertTranslationEntry(getDb(locals), locale, translationKey, translatedValue);
		return Response.json({ entry }, { status: 201 });
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Unable to create translation." },
			{ status: 400 },
		);
	}
};

async function parsePayload(request: Request): Promise<Record<string, unknown>> {
	const contentType = request.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		return (await request.json().catch(() => ({} as Record<string, unknown>))) ?? {};
	}

	const formData = await request.formData().catch(() => new FormData());
	const result: Record<string, unknown> = {};
	for (const [key, value] of formData.entries()) {
		result[key] = value;
	}
	return result;
}

function parseTranslations(value: unknown): Record<string, string> | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const entries = Object.entries(value as Record<string, unknown>);
	if (entries.length === 0) {
		return null;
	}

	const translations: Record<string, string> = {};
	for (const [locale, translatedValue] of entries) {
		if (typeof translatedValue !== "string") {
			continue;
		}
		translations[locale] = translatedValue;
	}

	return Object.keys(translations).length > 0 ? translations : null;
}
