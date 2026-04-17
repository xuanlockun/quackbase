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
		const body = request.headers.get("content-type")?.includes("application/json")
			? await request.json()
			: Object.fromEntries(await request.formData());
		const intent = typeof (body as Record<string, unknown>).intent === "string"
			? String((body as Record<string, unknown>).intent)
			: "create";
		const db = getDb(locals);

		if (intent === "delete") {
			const idValue = Number.parseInt(String((body as Record<string, unknown>).secretId ?? ""), 10);
			if (!Number.isFinite(idValue) || idValue <= 0) {
				throw new Error("Invalid secret id.");
			}

			await deleteAdminSecret(db, idValue);
			if (request.headers.get("content-type")?.includes("application/json")) {
				return Response.json({ ok: true });
			}
			return redirect("/admin/settings?secretDeleted=1");
		}

		const secretValue = String((body as Record<string, unknown>).secretValue ?? "").trim();
		const secretId = await createAdminSecret(
			db,
			{
				secretType: "cloudflare_api_access_token",
				label: "Cloudflare API Access Token",
				secretValue,
			},
			locals.runtime.env,
		);

		if (request.headers.get("content-type")?.includes("application/json")) {
			return Response.json({ ok: true, secretId });
		}

		return redirect("/admin/settings?secretSaved=1");
	} catch {
		if (request.headers.get("content-type")?.includes("application/json")) {
			return Response.json({ ok: false, error: "The secret request failed." }, { status: 400 });
		}
		return redirect("/admin/settings?secretError=1");
	}
};
