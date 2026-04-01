import type { APIRoute } from "astro";
import { logSecurityEvent } from "../../../lib/auth/audit";
import { getDb } from "../../../lib/blog";
import { listPermissions } from "../../../lib/db/permissions";
import { createRole, listRolesWithPermissions } from "../../../lib/db/roles";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const db = getDb(locals);
	const [roles, permissions] = await Promise.all([listRolesWithPermissions(db), listPermissions(db)]);
	return Response.json({ roles, permissions });
};

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const body = (await request.json()) as {
			name?: unknown;
			label?: unknown;
			description?: unknown;
			permissionIds?: unknown;
		};

		if (
			typeof body.name !== "string" ||
			typeof body.label !== "string" ||
			!Array.isArray(body.permissionIds)
		) {
			return Response.json({ error: "Invalid request body." }, { status: 400 });
		}

		const role = await createRole(
			getDb(locals),
			{
				name: body.name,
				label: body.label,
				description: typeof body.description === "string" ? body.description : null,
				permissionIds: body.permissionIds.map((value) => Number(value)).filter(Number.isFinite),
			},
			session.userId,
		);

		logSecurityEvent("rbac.role.created", { actorUserId: session.userId, roleId: role.id, roleName: role.name });
		return Response.json(role, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create role.";
		const status = /UNIQUE|unique/i.test(message) ? 409 : 400;
		return Response.json({ error: message }, { status });
	}
};
