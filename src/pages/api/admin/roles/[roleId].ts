import type { APIRoute } from "astro";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDb } from "../../../../lib/blog";
import { deleteRole, updateRole } from "../../../../lib/db/roles";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async (context) => updateRoleRequest(context, true);

export const DELETE: APIRoute = async (context) => deleteRoleRequest(context, true);

export const POST: APIRoute = async (context) => {
	const formData = await context.request.formData();
	return formData.get("_intent") === "delete"
		? deleteRoleRequest(context, false)
		: updateRoleRequest(context, false, formData);
};

async function updateRoleRequest(
	{ locals, request, redirect, params }: Parameters<APIRoute>[0],
	isJsonRequest: boolean,
	formData?: FormData,
) {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		isJsonRequest
			? { forceJson: true, clearCookieOnFailure: true }
			: { loginRedirect: "/admin/login", forbiddenRedirect: "/admin/roles" },
	);
	if (session instanceof Response) {
		return session;
	}

	const roleId = Number(params.roleId);
	if (!Number.isInteger(roleId) || roleId <= 0) {
		return isJsonRequest
			? Response.json({ error: "Invalid role id." }, { status: 400 })
			: redirect("/admin/roles?error=1");
	}

	try {
		const body: {
			label?: FormDataEntryValue | null;
			description?: FormDataEntryValue | null;
			permissionIds?: unknown[];
		} = isJsonRequest
			? ((await request.json()) as {
					label?: string;
					description?: string;
					permissionIds?: unknown[];
			  })
			: parseEditRoleForm(formData ?? (await request.formData()));

		const role = await updateRole(
			getDb(locals),
			roleId,
			{
				label: typeof body.label === "string" ? body.label : undefined,
				description: typeof body.description === "string" ? body.description : undefined,
				permissionIds: Array.isArray(body.permissionIds)
					? body.permissionIds.map((value: unknown) => Number(value)).filter(Number.isFinite)
					: undefined,
			},
			session.userId,
		);

		if (!role) {
			return isJsonRequest
				? Response.json({ error: "Role not found." }, { status: 404 })
				: redirect("/admin/roles?error=1");
		}

		logSecurityEvent("rbac.role.updated", { actorUserId: session.userId, roleId: role.id, roleName: role.name });
		return isJsonRequest ? Response.json(role) : redirect("/admin/roles?saved=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update role.";
		return isJsonRequest
			? Response.json({ error: message }, { status: 400 })
			: redirect(`/admin/roles/${roleId}/edit?error=${encodeURIComponent(message)}`);
	}
}

async function deleteRoleRequest(
	{ locals, request, redirect, params }: Parameters<APIRoute>[0],
	isJsonRequest: boolean,
) {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["roles.manage"],
		isJsonRequest
			? { forceJson: true, clearCookieOnFailure: true }
			: { loginRedirect: "/admin/login", forbiddenRedirect: "/admin/roles" },
	);
	if (session instanceof Response) {
		return session;
	}

	const roleId = Number(params.roleId);
	if (!Number.isInteger(roleId) || roleId <= 0) {
		return isJsonRequest
			? Response.json({ error: "Invalid role id." }, { status: 400 })
			: redirect("/admin/roles?error=1");
	}

	const result = await deleteRole(getDb(locals), roleId);
	if (result === "missing") {
		return isJsonRequest
			? Response.json({ error: "Role not found." }, { status: 404 })
			: redirect("/admin/roles?error=1");
	}

	if (result === "system") {
		return isJsonRequest
			? Response.json({ error: "System roles cannot be deleted." }, { status: 403 })
			: redirect("/admin/roles?error=system-role");
	}

	if (result === "assigned") {
		return isJsonRequest
			? Response.json({ error: "Role is still assigned to one or more users." }, { status: 409 })
			: redirect("/admin/roles?error=role-assigned");
	}

	logSecurityEvent("rbac.role.deleted", { actorUserId: session.userId, roleId });
	return isJsonRequest ? new Response(null, { status: 204 }) : redirect("/admin/roles?deleted=1");
}

function parseEditRoleForm(formData: FormData) {
	return {
		label: formData.get("label"),
		description: formData.get("description"),
		permissionIds: formData.getAll("permissionIds"),
	};
}
