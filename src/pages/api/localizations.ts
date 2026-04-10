import type { APIRoute } from "astro";
import { getDb } from "../../lib/blog";
import { loadLocalizationPayload } from "../../lib/localization";
import { FALLBACK_LANGUAGE_CATALOG } from "../../lib/languages";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
	try {
		const db = getDb(locals);
		const url = new URL(request.url);
		const catalog = locals.languageCatalog ?? FALLBACK_LANGUAGE_CATALOG;
		const localeParam = url.searchParams.get("locale") ?? locals.uiLanguage ?? catalog.defaultLanguageCode;
		const namespace = url.searchParams.get("namespace") ?? undefined;
		const payload = await loadLocalizationPayload(db, localeParam, namespace);

		return Response.json({
			locale: payload.requestedLocale,
			servedLocale: payload.servedLocale,
			fallbackLocale: payload.fallbackLocale,
			fallbackUsed: payload.fallbackUsed,
			namespace: payload.namespace,
			lastUpdated: payload.lastUpdated,
			translations: payload.translations,
		});
	} catch (error) {
		console.error("Failed to load localization payload", error);
		return Response.json({ error: "Failed to load localization data." }, { status: 500 });
	}
};
