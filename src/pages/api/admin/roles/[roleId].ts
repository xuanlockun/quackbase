import type { APIRoute } from "astro";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDb } from "../../../../lib/blog";
import { deleteRole, updateRole } from "../../../../lib/db/roles";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const roleId = Number(params.roleId);
	if (!Number.isInteger(roleId) || roleId <= 0) {
		return Response.json({ error: "Invalid role id." }, { status: 400 });
	}

	try {
		const body = (await request.json()) as {
			label?: unknown;
			description?: unknown;
			permissionIds?: unknown;
		};

		const role = await updateRole(
			getDb(locals),
			roleId,
			{
				label: typeof body.label === "string" ? body.label : undefined,
				description: typeof body.description === "string" ? body.description : undefined,
				permissionIds: Array.isArray(body.permissionIds)
					? body.permissionIds.map((value) => Number(value)).filter(Number.isFinite)
					: undefined,
			},
			session.userId,
		);

		if (!role) {
			return Response.json({ error: "Role not found." }, { status: 404 });
		}

		logSecurityEvent("rbac.role.updated", { actorUserId: session.userId, roleId: role.id, roleName: role.name });
		return Response.json(role);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Failed to update role." },
			{ status: 400 },
		);
	}
};

export const DELETE: APIRoute = async ({ locals, request, redirect, params }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const roleId = Number(params.roleId);
	if (!Number.isInteger(roleId) || roleId <= 0) {
		return Response.json({ error: "Invalid role id." }, { status: 400 });
	}

	const result = await deleteRole(getDb(locals), roleId);
	if (result === "missing") {
		return Response.json({ error: "Role not found." }, { status: 404 });
	}

	if (result === "system") {
		return Response.json({ error: "System roles cannot be deleted." }, { status: 403 });
	}

	if (result === "assigned") {
		return Response.json({ error: "Role is still assigned to one or more users." }, { status: 409 });
	}

	logSecurityEvent("rbac.role.deleted", { actorUserId: session.userId, roleId });
	return new Response(null, { status: 204 });
};
