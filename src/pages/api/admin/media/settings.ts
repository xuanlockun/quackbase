import type { APIRoute } from "astro";
import {
	getDb,
	parseMediaStorageSettingsForm,
	saveMediaStorageSettings,
} from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";
import { upsertAdminSecret } from "../../../../lib/secrets";

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
		const mediaSettings = parseMediaStorageSettingsForm(formData);
		const s3AccessKeyId = String(formData.get("s3AccessKeyId") ?? "").trim();
		const s3SecretAccessKey = String(formData.get("s3SecretAccessKey") ?? "").trim();

		await saveMediaStorageSettings(db, mediaSettings);

		if (s3AccessKeyId) {
			await upsertAdminSecret(
				db,
				{
					secretType: "media_s3_access_key_id",
					label: "Media S3 Access Key ID",
					secretValue: s3AccessKeyId,
				},
				locals.runtime.env,
			);
		}

		if (s3SecretAccessKey) {
			await upsertAdminSecret(
				db,
				{
					secretType: "media_s3_secret_access_key",
					label: "Media S3 Secret Access Key",
					secretValue: s3SecretAccessKey,
				},
				locals.runtime.env,
			);
		}

		return redirect("/admin/settings?mediaSaved=1");
	} catch {
		return redirect("/admin/settings?mediaError=1");
	}
};
