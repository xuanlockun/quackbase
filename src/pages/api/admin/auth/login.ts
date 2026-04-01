import type { APIRoute } from "astro";
import { findAdminUserByEmail, updateLastLoginAt } from "../../../../lib/db/admin-users";
import { getEffectiveAccessForUser } from "../../../../lib/db/permissions";
import { getDb } from "../../../../lib/blog";
import { createAdminSessionCookie, clearAdminSessionCookie } from "../../../../lib/auth/cookies";
import { signAdminJwt } from "../../../../lib/auth/jwt";
import { verifyPassword } from "../../../../lib/auth/passwords";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDefaultAdminPath } from "../../../../lib/rbac/policies";

export const prerender = false;

function prefersJson(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	const contentType = request.headers.get("content-type") ?? "";
	return accept.includes("application/json") || contentType.includes("application/json");
}

async function readCredentials(request: Request): Promise<{ email: string; password: string }> {
	const contentType = request.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		const body = (await request.json()) as { email?: unknown; password?: unknown };
		return {
			email: typeof body.email === "string" ? body.email : "",
			password: typeof body.password === "string" ? body.password : "",
		};
	}

	const formData = await request.formData();
	return {
		email: typeof formData.get("email") === "string" ? String(formData.get("email")) : "",
		password: typeof formData.get("password") === "string" ? String(formData.get("password")) : "",
	};
}

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const wantsJson = prefersJson(request);

	try {
		const { email, password } = await readCredentials(request);
		const normalizedEmail = email.trim().toLowerCase();
		const user = await findAdminUserByEmail(getDb(locals), normalizedEmail);

		if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
			logSecurityEvent("auth.login.failed", { email: normalizedEmail || null, reason: "invalid_credentials" });

			if (wantsJson) {
				return new Response(JSON.stringify({ error: "Invalid credentials." }), {
					status: 401,
					headers: {
						"Content-Type": "application/json; charset=utf-8",
						"Set-Cookie": clearAdminSessionCookie(request.url),
					},
				});
			}

			const response = redirect("/admin/login?error=invalid");
			response.headers.set("Set-Cookie", clearAdminSessionCookie(request.url));
			return response;
		}

		const effectiveAccess = await getEffectiveAccessForUser(getDb(locals), user.id);
		if (effectiveAccess.roles.length === 0) {
			logSecurityEvent("auth.login.failed", { email: normalizedEmail, userId: user.id, reason: "no_admin_role" });

			if (wantsJson) {
				return new Response(JSON.stringify({ error: "Admin access is not assigned." }), {
					status: 401,
					headers: {
						"Content-Type": "application/json; charset=utf-8",
						"Set-Cookie": clearAdminSessionCookie(request.url),
					},
				});
			}

			const response = redirect("/admin/login?error=access-denied");
			response.headers.set("Set-Cookie", clearAdminSessionCookie(request.url));
			return response;
		}

		await updateLastLoginAt(getDb(locals), user.id);
		const token = await signAdminJwt(user.id, user.email, locals.runtime.env.JWT_SECRET);
		const sessionCookie = createAdminSessionCookie(token, request.url);

		logSecurityEvent("auth.login.success", { userId: user.id, email: user.email });

		if (wantsJson) {
			return new Response(null, {
				status: 204,
				headers: {
					"Set-Cookie": sessionCookie,
				},
			});
		}

		const response = redirect(
			getDefaultAdminPath({
				userId: user.id,
				email: user.email,
				displayName: user.displayName,
				isActive: true,
				roles: effectiveAccess.roles,
				permissions: effectiveAccess.permissions.map((permission) => permission.name),
				isSuperadmin: effectiveAccess.roles.some((role) => role.name === "superadmin"),
			}),
		);
		response.headers.set("Set-Cookie", sessionCookie);
		return response;
	} catch (error) {
		logSecurityEvent("auth.login.failed", { reason: "unexpected_error", message: error instanceof Error ? error.message : "unknown" });

		if (wantsJson) {
			return new Response(JSON.stringify({ error: "Login failed." }), {
				status: 401,
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Set-Cookie": clearAdminSessionCookie(request.url),
				},
			});
		}

		const response = redirect("/admin/login?error=invalid");
		response.headers.set("Set-Cookie", clearAdminSessionCookie(request.url));
		return response;
	}
};
