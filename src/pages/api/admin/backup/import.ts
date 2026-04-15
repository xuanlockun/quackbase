import type { APIRoute } from "astro";
import { getD1BackupConfig, importD1SqlBackup } from "../../../../lib/backup";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ forceJson: false, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	const env = locals.runtime.env as Record<string, string | undefined>;
	const config = getD1BackupConfig(env);
	if (!config) {
		return redirect(
			"/admin/backup?importError=" +
				encodeURIComponent(
					"Backup import is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN as secrets, and optionally D1_DATABASE_ID.",
				),
		);
	}

	try {
		const formData = await request.formData();
		const file = formData.get("sqlFile");
		if (!(file instanceof File) || file.size <= 0) {
			return redirect("/admin/backup?importError=" + encodeURIComponent("Please choose a SQL file to import."));
		}

		await importD1SqlBackup(config, file);
		return redirect("/admin/backup?imported=1");
	} catch (error) {
		const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
		return redirect(`/admin/backup?importError=${message}`);
	}
};
