import { defineMiddleware } from "astro:middleware";
import { clearAdminSessionCookie } from "./lib/auth/cookies";
import { resolveAdminSession } from "./lib/auth/session";
import {
	getDefaultAdminPath,
	getRequiredAdminPagePermissions,
	sessionHasPermissions,
} from "./lib/rbac/policies";

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

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
