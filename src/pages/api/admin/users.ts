import type { APIRoute } from "astro";
import { createAdminUser, listAdminUsers } from "../../../lib/db/admin-users";
import { listRoleSummaries } from "../../../lib/db/roles";
import { hashPassword } from "../../../lib/auth/passwords";
import { logSecurityEvent } from "../../../lib/auth/audit";
import { getDb } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["users.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const db = getDb(locals);
	const [users, roles] = await Promise.all([listAdminUsers(db), listRoleSummaries(db)]);

	return Response.json({ users, roles });
};

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["users.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const body = (await request.json()) as {
			email?: unknown;
			password?: unknown;
			displayName?: unknown;
			roleIds?: unknown;
			isActive?: unknown;
		};

		if (
			typeof body.email !== "string" ||
			typeof body.password !== "string" ||
			typeof body.displayName !== "string" ||
			!Array.isArray(body.roleIds)
		) {
			return Response.json({ error: "Invalid request body." }, { status: 400 });
		}

		const user = await createAdminUser(
			getDb(locals),
			{
				email: body.email,
				displayName: body.displayName,
				passwordHash: await hashPassword(body.password),
				isActive: body.isActive !== false,
				roleIds: body.roleIds.map((value) => Number(value)).filter(Number.isFinite),
			},
			session.userId,
		);

		logSecurityEvent("rbac.user.created", { actorUserId: session.userId, targetUserId: user.id, email: user.email });
		return Response.json(user, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create user.";
		const status = /UNIQUE|unique/i.test(message) ? 409 : 400;
		return Response.json({ error: message }, { status });
	}
};
