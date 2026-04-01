import type { APIRoute } from "astro";
import { updateAdminUser } from "../../../../lib/db/admin-users";
import { hashPassword } from "../../../../lib/auth/passwords";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["users.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const userId = Number(params.userId);
	if (!Number.isInteger(userId) || userId <= 0) {
		return Response.json({ error: "Invalid user id." }, { status: 400 });
	}

	try {
		const body = (await request.json()) as {
			displayName?: unknown;
			password?: unknown;
			isActive?: unknown;
			roleIds?: unknown;
		};

		const updatedUser = await updateAdminUser(
			getDb(locals),
			userId,
			{
				displayName: typeof body.displayName === "string" ? body.displayName : undefined,
				passwordHash: typeof body.password === "string" && body.password.trim() !== "" ? await hashPassword(body.password) : undefined,
				isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
				roleIds: Array.isArray(body.roleIds)
					? body.roleIds.map((value) => Number(value)).filter(Number.isFinite)
					: undefined,
			},
			session.userId,
		);

		if (!updatedUser) {
			return Response.json({ error: "User not found." }, { status: 404 });
		}

		logSecurityEvent("rbac.user.updated", { actorUserId: session.userId, targetUserId: updatedUser.id });
		return Response.json(updatedUser);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Failed to update user." },
			{ status: 400 },
		);
	}
};
