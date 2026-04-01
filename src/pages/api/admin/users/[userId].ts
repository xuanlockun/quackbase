import type { APIRoute } from "astro";
import { updateAdminUser } from "../../../../lib/db/admin-users";
import { hashPassword } from "../../../../lib/auth/passwords";
import { logSecurityEvent } from "../../../../lib/auth/audit";
import { getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const PATCH: APIRoute = async (context) => updateUser(context, true);

export const POST: APIRoute = async (context) => updateUser(context, false);

async function updateUser(
	{ locals, request, redirect, params }: Parameters<APIRoute>[0],
	isJsonRequest: boolean,
) {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["users.manage"],
		isJsonRequest
			? { forceJson: true, clearCookieOnFailure: true }
			: { loginRedirect: "/admin/login", forbiddenRedirect: "/admin/users" },
	);
	if (session instanceof Response) {
		return session;
	}

	const userId = Number(params.userId);
	if (!Number.isInteger(userId) || userId <= 0) {
		return isJsonRequest
			? Response.json({ error: "Invalid user id." }, { status: 400 })
			: redirect("/admin/users?error=1");
	}

	try {
		const body: {
			displayName?: FormDataEntryValue | null;
			password?: FormDataEntryValue | null;
			isActive?: boolean;
			roleIds?: unknown[];
		} = isJsonRequest
			? ((await request.json()) as {
					displayName?: string;
					password?: string;
					isActive?: boolean;
					roleIds?: unknown[];
			  })
			: parseEditUserForm(await request.formData());

		const updatedUser = await updateAdminUser(
			getDb(locals),
			userId,
			{
				displayName: typeof body.displayName === "string" ? body.displayName : undefined,
				passwordHash:
					typeof body.password === "string" && body.password.trim() !== ""
						? await hashPassword(body.password)
						: undefined,
				isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
				roleIds: Array.isArray(body.roleIds)
					? body.roleIds.map((value: unknown) => Number(value)).filter(Number.isFinite)
					: undefined,
			},
			session.userId,
		);

		if (!updatedUser) {
			return isJsonRequest
				? Response.json({ error: "User not found." }, { status: 404 })
				: redirect("/admin/users?error=1");
		}

		logSecurityEvent("rbac.user.updated", { actorUserId: session.userId, targetUserId: updatedUser.id });
		return isJsonRequest ? Response.json(updatedUser) : redirect("/admin/users?saved=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to update user.";
		return isJsonRequest
			? Response.json({ error: message }, { status: 400 })
			: redirect(`/admin/users/${userId}/edit?error=${encodeURIComponent(message)}`);
	}
}

function parseEditUserForm(formData: FormData) {
	return {
		displayName: formData.get("displayName"),
		password: formData.get("password"),
		isActive: formData.get("isActive") === "on",
		roleIds: formData.getAll("roleIds"),
	};
}
