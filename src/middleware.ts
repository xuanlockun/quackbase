import { defineMiddleware } from "astro:middleware";
import { getDb } from "./lib/blog";
import { clearAdminSessionCookie } from "./lib/auth/cookies";
import { resolveAdminSession } from "./lib/auth/session";
import {
	FALLBACK_LANGUAGE_CATALOG,
	loadLanguageCatalog,
	isValidLanguageCode,
	LanguageCatalogState,
} from "./lib/languages";
import { readUiLanguagePreference, resolveUiLanguage, writeUiLanguagePreference } from "./lib/i18n";
import { loadLocalizationPayload } from "./lib/localization";
import {
	getDefaultAdminPath,
	getRequiredAdminPagePermissions,
	sessionHasPermissions,
} from "./lib/rbac/policies";

function ensureCatalog(catalog: LanguageCatalogState | null): LanguageCatalogState {
	if (!catalog || catalog.enabledLanguages.length === 0) {
		return FALLBACK_LANGUAGE_CATALOG;
	}
	return catalog;
}

function removeLeadingLanguageSegment(pathname: string, catalog: LanguageCatalogState): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return "/";
	}
	if (isValidLanguageCode(segments[0]) && catalog.enabledLanguages.every((lang) => lang.code !== segments[0])) {
		segments.shift();
	}
	if (segments.length === 0) {
		return "/";
	}
	return `/${segments.join("/")}`;
}

function buildFallbackPath(
	pathname: string,
	search: string,
	hash: string,
	catalog: LanguageCatalogState,
): string {
	const normalized = removeLeadingLanguageSegment(pathname, catalog);
	const trailingSlash = pathname.endsWith("/") || normalized === "/";
	let base = normalized === "/" ? "/" : normalized;
	const prefix = `/${catalog.defaultLanguageCode}`;
	const combined = base === "/" ? "/" : `${base.startsWith("/") ? base : `/${base}`}`;
	const path = trailingSlash && !combined.endsWith("/") ? `${combined}/` : combined;
	return `${prefix}${path === "/" ? "/" : path}${search}${hash}`;
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	try {
		const db = getDb(context.locals);
		const catalog = ensureCatalog(await loadLanguageCatalog(db));
		context.locals.languageCatalog = catalog;
		if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
			const firstSegment = pathname.split("/").filter(Boolean)[0];
			if (firstSegment && isValidLanguageCode(firstSegment) && catalog.enabledLanguages.every((lang) => lang.code !== firstSegment)) {
				const redirectPath = buildFallbackPath(context.url.pathname, context.url.search, context.url.hash, catalog);
				return context.redirect(redirectPath);
			}
		}
	} catch {
		context.locals.languageCatalog = FALLBACK_LANGUAGE_CATALOG;
	}

	const storedUiLanguage = readUiLanguagePreference(context.cookies, context.locals.languageCatalog);
	const { language: uiLanguage, explicitLanguage } = resolveUiLanguage(
		context.url,
		storedUiLanguage,
		context.locals.languageCatalog,
	);

	context.locals.uiLanguage = uiLanguage;
	try {
		const db = getDb(context.locals);
		context.locals.localizationPayload = await loadLocalizationPayload(db, uiLanguage);
	} catch {
		context.locals.localizationPayload = undefined;
	}

	if (explicitLanguage && explicitLanguage !== storedUiLanguage) {
		writeUiLanguagePreference(context.cookies, explicitLanguage, context.locals.languageCatalog);
	}

	if (!pathname.startsWith("/admin")) {
		return next();
	}

	const session = await resolveAdminSession(context.request, context.locals);
	context.locals.adminSession = session;

	if (pathname === "/admin/login") {
		if (session) {
			return context.redirect(getDefaultAdminPath(session));
		}

		return next();
	}

	if (!session) {
		const response = context.redirect("/admin/login");
		response.headers.set("Set-Cookie", clearAdminSessionCookie(context.request.url));
		return response;
	}

	const requiredPermissions = getRequiredAdminPagePermissions(pathname) ?? [];
	if (!sessionHasPermissions(session, requiredPermissions)) {
		const fallbackPath = getDefaultAdminPath(session);
		if (fallbackPath === "/admin/login?error=access-denied") {
			const response = context.redirect(fallbackPath);
			response.headers.set("Set-Cookie", clearAdminSessionCookie(context.request.url));
			return response;
		}

		return context.redirect(fallbackPath);
	}

	return next();
});
