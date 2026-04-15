import type { APIRoute } from "astro";
import { exportD1SqlBackup, getD1BackupConfig } from "../../../../lib/backup";
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
			"/admin/backup?exportError=" +
				encodeURIComponent(
					"Backup export is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN as secrets, and optionally D1_DATABASE_ID.",
				),
		);
	}

	try {
		const formData = await request.formData().catch(() => new FormData());
		const tables = formData
			.getAll("tables")
			.map((entry) => (typeof entry === "string" ? entry : ""))
			.map((value) => value.trim())
			.filter((value) => Boolean(value));

		const result = await exportD1SqlBackup(config, {
			tables,
		});
		const downloadResponse = await fetch(result.downloadUrl);
		if (!downloadResponse.ok) {
			return redirect("/admin/backup?exportError=" + encodeURIComponent("Failed to download the backup file."));
		}

		const headers = new Headers();
		headers.set("Content-Type", downloadResponse.headers.get("content-type") ?? "application/sql");
		headers.set("Content-Disposition", `attachment; filename="${sanitizeFilename(result.filename)}"`);
		headers.set("Cache-Control", "no-store");
		const contentLength = downloadResponse.headers.get("content-length");
		if (contentLength) {
			headers.set("Content-Length", contentLength);
		}

		return new Response(downloadResponse.body, {
			status: 200,
			headers,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unable to export backup.";
		return redirect("/admin/backup?exportError=" + encodeURIComponent(message));
	}
};

function sanitizeFilename(filename: string): string {
	const cleaned = filename.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
	return cleaned || "d1-backup.sql";
}
