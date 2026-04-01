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
	const isJsonRequest = (request.headers.get("content-type") ?? "").includes("application/json");
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

	try {
		const body: {
			email: string;
			displayName: string;
			password: string;
			isActive: boolean;
			roleIds: unknown[];
		} = isJsonRequest
			? ((await request.json()) as {
					email: string;
					displayName: string;
					password: string;
					isActive: boolean;
					roleIds: unknown[];
			  })
			: parseCreateUserForm(await request.formData());

		const user = await createAdminUser(
			getDb(locals),
			{
				email: body.email,
				displayName: body.displayName,
				passwordHash: await hashPassword(body.password),
				isActive: body.isActive !== false,
				roleIds: body.roleIds.map((value: unknown) => Number(value)).filter(Number.isFinite),
			},
			session.userId,
		);

		logSecurityEvent("rbac.user.created", { actorUserId: session.userId, targetUserId: user.id, email: user.email });
		return isJsonRequest ? Response.json(user, { status: 201 }) : redirect("/admin/users?created=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to create user.";
		const status = /UNIQUE|unique/i.test(message) ? 409 : 400;
		return isJsonRequest
			? Response.json({ error: message }, { status })
			: redirect(`/admin/users/new?error=${encodeURIComponent(message)}`);
	}
};

function parseCreateUserForm(formData: FormData) {
	const email = formData.get("email");
	const displayName = formData.get("displayName");
	const password = formData.get("password");

	if (typeof email !== "string" || typeof displayName !== "string" || typeof password !== "string") {
		throw new Error("Invalid request body.");
	}

	return {
		email,
		displayName,
		password,
		isActive: formData.get("isActive") === "on",
		roleIds: formData.getAll("roleIds"),
	};
}
