import { findAdminUserById } from "../db/admin-users";
import { getEffectiveAccessForUser } from "../db/permissions";
import { getDb } from "../blog";
import { readAdminSessionCookie } from "./cookies";
import { verifyAdminJwt } from "./jwt";
import type { AdminSession } from "./types";

export async function resolveAdminSession(
	request: Request,
	locals: App.Locals,
): Promise<AdminSession | null> {
	const token = readAdminSessionCookie(request);
	if (!token) {
		return null;
	}

	const db = getDb(locals);
	const claims = await verifyAdminJwt(token, db);
	if (!claims) {
		return null;
	}

	const user = await findAdminUserById(db, claims.userId);
	if (!user || !user.isActive) {
		return null;
	}

	const effectiveAccess = await getEffectiveAccessForUser(db, user.id);
	if (effectiveAccess.roles.length === 0) {
		return null;
	}

	return {
		userId: user.id,
		email: user.email,
		displayName: user.displayName,
		isActive: user.isActive,
		roles: effectiveAccess.roles,
		permissions: effectiveAccess.permissions.map((permission) => permission.name),
		isSuperadmin: effectiveAccess.roles.some((role) => role.name === "superadmin"),
	};
}
