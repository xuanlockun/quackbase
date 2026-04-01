import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { listPermissions } from "../../../lib/db/permissions";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["permissions.read"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const permissions = await listPermissions(getDb(locals));
	return Response.json({ permissions });
};
