import type { APIRoute } from "astro";
import { clearAdminSessionCookie } from "../../../../lib/auth/cookies";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getRequestAdminSession } from "../../../../lib/rbac/guards";

export const prerender = false;

function prefersJson(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	const contentType = request.headers.get("content-type") ?? "";
	return accept.includes("application/json") || contentType.includes("application/json");
}

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await getRequestAdminSession(request, locals);
	if (session) {
		logSecurityEvent("auth.logout", { userId: session.userId, email: session.email });
	}

	const cookie = clearAdminSessionCookie(request.url);
	if (prefersJson(request)) {
		return new Response(null, {
			status: 204,
			headers: {
				"Set-Cookie": cookie,
			},
		});
	}

	const response = redirect("/admin/login");
	response.headers.set("Set-Cookie", cookie);
	return response;
};
