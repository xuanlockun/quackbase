import type { APIRoute } from "astro";
import { getDb } from "../../../../../lib/blog";
import { importLocaleTranslationFile, importTranslationExportPayload } from "../../../../../lib/translations";
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

		const importLocale = typeof formData.get("locale") === "string" ? String(formData.get("locale")).trim().toLowerCase() : "";
		const languageName = typeof formData.get("languageName") === "string" ? String(formData.get("languageName")).trim() : "";
		const payload = JSON.parse(await file.text());
		const inferredLocale = inferLocaleFromFilename(file.name) || importLocale;
		const result =
			inferredLocale && isLocaleJsonPayload(payload)
				? await importLocaleTranslationFile(getDb(locals), inferredLocale, payload, languageName || undefined)
				: await importTranslationExportPayload(getDb(locals), payload);
		return redirect(
			`/admin/languages?imported=1&languagesUpdated=${encodeURIComponent(String(result.languagesUpdated))}&translationsUpdated=${encodeURIComponent(String(result.translationsUpdated))}`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Translation import failed.";
		return redirect("/admin/languages?importError=" + encodeURIComponent(message));
	}
};

function inferLocaleFromFilename(filename: string): string {
	const match = filename.trim().toLowerCase().match(/^([a-z]{2}(?:-[a-z]{2})?)\.(json|sql)$/i);
	return match?.[1] ?? "";
}

function isLocaleJsonPayload(payload: unknown): boolean {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		return false;
	}

	return !("translations" in (payload as Record<string, unknown>)) && !("languages" in (payload as Record<string, unknown>));
}
