import type { APIContext } from "astro";
import { clearAdminSessionCookie } from "../auth/cookies";
import { resolveAdminSession } from "../auth/session";
import type { AdminSession } from "../auth/types";
import { getDefaultAdminPath, sessionHasPermissions } from "./policies";

function jsonResponse(status: number, error: string): Response {
	return new Response(JSON.stringify({ error }), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

function prefersJson(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	const contentType = request.headers.get("content-type") ?? "";
	return accept.includes("application/json") || contentType.includes("application/json");
}

export async function getRequestAdminSession(
	request: Request,
	locals: App.Locals,
): Promise<AdminSession | null> {
	if (locals.adminSession !== undefined) {
		return locals.adminSession;
	}

	const session = await resolveAdminSession(request, locals);
	locals.adminSession = session;
	return session;
}

export async function requireApiPermission(
	context: Pick<APIContext, "locals" | "request" | "redirect">,
	requiredPermissions: readonly string[] = [],
	options?: {
		loginRedirect?: string;
		forbiddenRedirect?: string;
		forceJson?: boolean;
		clearCookieOnFailure?: boolean;
	},
): Promise<AdminSession | Response> {
	const session = await getRequestAdminSession(context.request, context.locals);
	const wantsJson = options?.forceJson ?? prefersJson(context.request);

	if (!session) {
		if (wantsJson) {
			const response = jsonResponse(401, "Authentication required.");
			if (options?.clearCookieOnFailure) {
				response.headers.set("Set-Cookie", clearAdminSessionCookie(context.request.url));
			}
			return response;
		}

		const response = context.redirect(options?.loginRedirect ?? "/admin/login");
		if (options?.clearCookieOnFailure) {
			response.headers.set("Set-Cookie", clearAdminSessionCookie(context.request.url));
		}
		return response;
	}

	if (!sessionHasPermissions(session, requiredPermissions)) {
		if (wantsJson) {
			return jsonResponse(403, "Missing required permission.");
		}

		return context.redirect(options?.forbiddenRedirect ?? getDefaultAdminPath(session));
	}

	return session;
}
