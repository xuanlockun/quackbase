import type { APIRoute } from "astro";
import { getDb, getMediaStorageSettings, parseMediaStorageSettingsForm, saveMediaStorageSettings } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";
import { testMediaStorageConnection } from "../../../../lib/media";

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
		const intent = String(formData.get("intent") ?? "save").trim();
		const db = getDb(locals);
		const currentSettings = await getMediaStorageSettings(db);
		const formSettings = parseMediaStorageSettingsForm(formData);
		const mergedSettings = {
			...currentSettings,
			...formSettings,
			s3AccessKeyId: formSettings.s3AccessKeyId || currentSettings.s3AccessKeyId,
			s3SecretAccessKey: formSettings.s3SecretAccessKey || currentSettings.s3SecretAccessKey,
		};

		if (intent === "test") {
			await testMediaStorageConnection(mergedSettings);
			return Response.json({ ok: true, message: "Media storage connection succeeded." });
		}

		await saveMediaStorageSettings(db, mergedSettings);
		return redirect("/admin/settings?mediaSaved=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Media storage settings could not be saved.";
		if (request.headers.get("x-requested-with") === "fetch" || request.headers.get("accept")?.includes("application/json")) {
			return Response.json({ ok: false, error: message }, { status: 400 });
		}
		return redirect(`/admin/settings?mediaError=${encodeURIComponent(message)}`);
	}
};
