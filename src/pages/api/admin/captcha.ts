import type { APIRoute } from "astro";
import { getDb, parseCaptchaSettingsForm, saveCaptchaSettings } from "../../../lib/blog";
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

	const formData = await request.formData();
	try {
		await saveCaptchaSettings(getDb(locals), parseCaptchaSettingsForm(formData));
		return redirect("/admin/settings?captchaSaved=1");
	} catch {
		return redirect("/admin/settings?captchaError=1");
	}
};
