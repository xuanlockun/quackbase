import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { createAdminSecret, deleteAdminSecret } from "../../../lib/secrets";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/settings" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const intent = typeof formData.get("intent") === "string" ? formData.get("intent") : "create";
		const db = getDb(locals);

		if (intent === "delete") {
			const idValue = Number.parseInt(String(formData.get("secretId") ?? ""), 10);
			if (!Number.isFinite(idValue) || idValue <= 0) {
				throw new Error("Invalid secret id.");
			}

			await deleteAdminSecret(db, idValue);
			return redirect("/admin/settings?secretDeleted=1");
		}

		const secretValue = String(formData.get("secretValue") ?? "").trim();
		await createAdminSecret(
			db,
			{
				secretType: "cloudflare_api_access_token",
				label: "Cloudflare API Access Token",
				secretValue,
			},
			locals.runtime.env,
		);

		return redirect("/admin/settings?secretSaved=1");
	} catch {
		return redirect("/admin/settings?secretError=1");
	}
};
