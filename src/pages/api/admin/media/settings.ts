import type { APIRoute } from "astro";
import {
	getDb,
	parseMediaStorageSettingsForm,
	saveMediaStorageSettings,
} from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

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
		const db = getDb(locals);
		const existingSettings = await getExistingSettings(db);
		const formSettings = parseMediaStorageSettingsForm(formData);

		await saveMediaStorageSettings(db, {
			...formSettings,
			s3AccessKeyId: formSettings.s3AccessKeyId || existingSettings.s3AccessKeyId,
			s3SecretAccessKey: formSettings.s3SecretAccessKey || existingSettings.s3SecretAccessKey,
		});

		return redirect("/admin/settings?mediaSaved=1");
	} catch (error) {
		const message = encodeURIComponent(error instanceof Error ? error.message : "Media storage settings could not be saved.");
		return redirect(`/admin/settings?mediaError=${message}`);
	}
};

async function getExistingSettings(db: D1Database) {
	return db
		.prepare(
			`SELECT media_s3_access_key_id, media_s3_secret_access_key
			FROM site_settings
			WHERE id = 1`,
		)
		.first<{ media_s3_access_key_id: string; media_s3_secret_access_key: string }>()
		.then((row) => ({
			s3AccessKeyId: row?.media_s3_access_key_id?.trim() ?? "",
			s3SecretAccessKey: row?.media_s3_secret_access_key?.trim() ?? "",
		}));
}
