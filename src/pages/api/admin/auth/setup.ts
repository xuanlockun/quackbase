import type { APIRoute } from "astro";
import { createAdminSessionCookie } from "../../../../lib/auth/cookies";
import { signAdminJwt } from "../../../../lib/auth/jwt";
import { hashPassword } from "../../../../lib/auth/passwords";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDb } from "../../../../lib/blog";
import { createAdminUser, countAdminUsers } from "../../../../lib/db/admin-users";
import { getEffectiveAccessForUser } from "../../../../lib/db/permissions";
import { getDefaultAdminPath } from "../../../../lib/rbac/policies";

export const prerender = false;

function prefersJson(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	const contentType = request.headers.get("content-type") ?? "";
	return accept.includes("application/json") || contentType.includes("application/json");
}

async function readPayload(request: Request): Promise<{ email: string; displayName: string; password: string }> {
	const contentType = request.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		const body = (await request.json()) as { email?: unknown; displayName?: unknown; password?: unknown };
		return {
			email: typeof body.email === "string" ? body.email : "",
			displayName: typeof body.displayName === "string" ? body.displayName : "",
			password: typeof body.password === "string" ? body.password : "",
		};
	}

	const formData = await request.formData();
	return {
		email: typeof formData.get("email") === "string" ? String(formData.get("email")) : "",
		displayName: typeof formData.get("displayName") === "string" ? String(formData.get("displayName")) : "",
		password: typeof formData.get("password") === "string" ? String(formData.get("password")) : "",
	};
}

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const wantsJson = prefersJson(request);
	const db = getDb(locals);

	try {
		const userCount = await countAdminUsers(db);
		if (userCount > 0) {
			if (wantsJson) {
				return Response.json({ error: "Initial setup is no longer available." }, { status: 403 });
			}
			return redirect("/admin/login?error=access-denied");
		}

		const { email, displayName, password } = await readPayload(request);
		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || !displayName.trim() || !password.trim()) {
			throw new Error("Email, display name, and password are required.");
		}

		const superadminRole = await db
			.prepare(`SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1`)
			.first<{ id: number }>();
		if (!superadminRole?.id) {
			throw new Error("Superadmin role is missing from the database.");
		}

		const user = await createAdminUser(
			db,
			{
				email: normalizedEmail,
				displayName: displayName.trim(),
				passwordHash: await hashPassword(password),
				isActive: true,
				roleIds: [superadminRole.id],
			},
			undefined,
		);

		const effectiveAccess = await getEffectiveAccessForUser(db, user.id);
		const session = {
			userId: user.id,
			email: user.email,
			displayName: user.displayName,
			isActive: true,
			roles: effectiveAccess.roles,
			permissions: effectiveAccess.permissions.map((permission) => permission.name),
			isSuperadmin: true,
		};
		const token = await signAdminJwt(user.id, user.email, locals.runtime.env.JWT_SECRET);
		const sessionCookie = createAdminSessionCookie(token, request.url);
		const response = redirect(
			getDefaultAdminPath(session),
		);
		response.headers.set("Set-Cookie", sessionCookie);
		logSecurityEvent("auth.setup.success", { userId: user.id, email: user.email });
		return response;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Initial setup failed.";
		if (wantsJson) {
			return Response.json({ error: message }, { status: 400 });
		}
		return redirect(`/admin/login?setupError=${encodeURIComponent(message)}`);
	}
};
