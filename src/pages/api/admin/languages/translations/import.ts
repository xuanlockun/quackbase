import type { APIRoute } from "astro";
import { getDb } from "../../../../../lib/blog";
import { importTranslationExportPayload } from "../../../../../lib/translations";
import { requireApiPermission } from "../../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/languages" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const file = formData.get("translationsFile");
		if (!(file instanceof File) || file.size === 0) {
			return redirect("/admin/languages?importError=" + encodeURIComponent("Choose a JSON file to import."));
		}

		const payload = JSON.parse(await file.text());
		const result = await importTranslationExportPayload(getDb(locals), payload);
		return redirect(
			`/admin/languages?imported=1&languagesUpdated=${encodeURIComponent(String(result.languagesUpdated))}&translationsUpdated=${encodeURIComponent(String(result.translationsUpdated))}`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Translation import failed.";
		return redirect("/admin/languages?importError=" + encodeURIComponent(message));
	}
};
