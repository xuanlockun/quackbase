import type { APIRoute } from "astro";
import { getDb, parseSiteThemeSelectionForm, saveSiteThemeSelection } from "../../../lib/blog";
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
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/themes" },
	);
	if (session instanceof Response) {
		return session;
	}

	const formData = await request.formData();
	const successRedirectTo = resolveRedirectTarget(formData.get("successRedirectTo"), "/admin/themes?themeSaved=1");
	const errorRedirectTo = resolveRedirectTarget(formData.get("errorRedirectTo"), "/admin/themes?themeError=1");

	try {
		const input = parseSiteThemeSelectionForm(formData);
		await saveSiteThemeSelection(getDb(locals), input);
		return redirect(successRedirectTo);
	} catch {
		return redirect(errorRedirectTo);
	}
};
