import type { APIRoute } from "astro";
import { getDb, parseSiteSettingsForm, saveSiteSettings } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

function resolveRedirectTarget(value: FormDataEntryValue | null, fallback: string): string {
	if (typeof value !== "string") {
		return fallback;
	}

	const target = value.trim();
	if (!target.startsWith("/") || target.includes("://")) {
		return fallback;
	}

	return target;
}

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/settings" },
	);
	if (session instanceof Response) {
		return session;
	}

	const formData = await request.formData();
	const successRedirectTo = resolveRedirectTarget(formData.get("successRedirectTo"), "/admin/settings?siteSaved=1");
	const errorRedirectTo = resolveRedirectTarget(formData.get("errorRedirectTo"), "/admin/settings?siteError=1");

	try {
		const input = parseSiteSettingsForm(formData);
		await saveSiteSettings(getDb(locals), input);
		return redirect(successRedirectTo);
	} catch {
		return redirect(errorRedirectTo);
	}
};
