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
	const isJsonRequest = (request.headers.get("content-type") ?? "").includes("application/json");
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

	try {
		const body: {
			name: string;
			label: string;
			description?: FormDataEntryValue | null;
			permissionIds: unknown[];
		} = isJsonRequest
			? ((await request.json()) as {
					name: string;
					label: string;
					description?: string;
					permissionIds: unknown[];
			  })
			: parseCreateRoleForm(await request.formData());

		const role = await createRole(
			getDb(locals),
			{
				name: body.name,
				label: body.label,
				description: typeof body.description === "string" ? body.description : null,
				permissionIds: body.permissionIds.map((value: unknown) => Number(value)).filter(Number.isFinite),
			},
			session.userId,
		);

		logSecurityEvent("rbac.role.created", { actorUserId: session.userId, roleId: role.id, roleName: role.name });
		return isJsonRequest ? Response.json(role, { status: 201 }) : redirect("/admin/roles?created=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create role.";
		const status = /UNIQUE|unique/i.test(message) ? 409 : 400;
		return isJsonRequest
			? Response.json({ error: message }, { status })
			: redirect(`/admin/roles/new?error=${encodeURIComponent(message)}`);
	}
};

function parseCreateRoleForm(formData: FormData) {
	const name = formData.get("name");
	const label = formData.get("label");

	if (typeof name !== "string" || typeof label !== "string") {
		throw new Error("Invalid request body.");
	}

	return {
		name,
		label,
		description: formData.get("description"),
		permissionIds: formData.getAll("permissionIds"),
	};
}
