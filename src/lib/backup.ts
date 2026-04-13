const DEFAULT_D1_DATABASE_ID = "d0365841-9c7f-4cad-b9f0-6ee5c1bf6810";
const D1_EXPORT_POLL_INTERVAL_MS = 1000;
const D1_EXPORT_MAX_ATTEMPTS = 30;

export interface D1BackupConfig {
	accountId: string;
	apiToken: string;
	databaseId: string;
}

export interface D1BackupResult {
	downloadUrl: string;
	filename: string;
}

export function getD1BackupConfig(env: Record<string, string | undefined>): D1BackupConfig | null {
	const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
	const apiToken = env.CLOUDFLARE_API_TOKEN?.trim() ?? "";
	const databaseId = env.D1_DATABASE_ID?.trim() || DEFAULT_D1_DATABASE_ID;

	if (!accountId || !apiToken || !databaseId) {
		return null;
	}

	return {
		accountId,
		apiToken,
		databaseId,
	};
}

export function isD1BackupConfigured(env: Record<string, string | undefined>): boolean {
	return Boolean(getD1BackupConfig(env));
}

export async function exportD1SqlBackup(config: D1BackupConfig): Promise<D1BackupResult> {
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/export`;
	let bookmark: string | null = null;

	for (let attempt = 0; attempt < D1_EXPORT_MAX_ATTEMPTS; attempt += 1) {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.apiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				output_format: "polling",
				...(bookmark ? { current_bookmark: bookmark } : {}),
			}),
		});

		const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
		if (!response.ok || body.success === false) {
			throw new Error(extractCloudflareError(body) ?? "Unable to export D1 database.");
		}

		const result = normalizeExportResult(body);
		if (result.status === "complete") {
			const downloadUrl = result.downloadUrl;
			if (!downloadUrl) {
				throw new Error("D1 export did not return a download URL.");
			}

			return {
				downloadUrl,
				filename: result.filename ?? `d1-backup-${new Date().toISOString().slice(0, 10)}.sql`,
			};
		}

		if (result.status === "error") {
			throw new Error(result.message ?? "Unable to export D1 database.");
		}

		if (typeof result.bookmark === "string" && result.bookmark.trim()) {
			bookmark = result.bookmark.trim();
		}

		await sleep(D1_EXPORT_POLL_INTERVAL_MS);
	}

	throw new Error("Backup export is taking too long. Please try again.");
}

function normalizeExportResult(body: Record<string, unknown>): {
	status: string;
	downloadUrl: string | null;
	filename: string | null;
	message: string | null;
	bookmark: string | null;
} {
	const result = (body.result ?? body) as Record<string, unknown>;
	const nested = (result.result ?? result) as Record<string, unknown>;
	const status =
		String(result.status ?? nested.status ?? body.status ?? "").trim().toLowerCase() || "processing";
	const downloadUrl = extractString(nested.signed_url ?? nested.download_url ?? nested.url ?? result.signed_url ?? result.url);
	const filename = extractString(nested.filename ?? result.filename);
	const message =
		extractString(result.message ?? nested.message) ||
		extractNestedErrorMessage(body.error) ||
		extractString(body.error);
	const bookmark = extractString(result.at_bookmark ?? nested.at_bookmark ?? result.current_bookmark ?? body.at_bookmark);

	return { status, downloadUrl, filename, message, bookmark };
}

function extractString(value: unknown): string | null {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractCloudflareError(body: Record<string, unknown>): string | null {
	if (typeof body.errors === "string" && body.errors.trim()) {
		return body.errors;
	}

	if (Array.isArray(body.errors) && body.errors.length > 0) {
		const first = body.errors[0] as Record<string, unknown> | string | undefined;
		if (typeof first === "string" && first.trim()) {
			return first;
		}
		if (first && typeof first === "object") {
			const message = extractString(first.message ?? first.error);
			if (message) {
				return message;
			}
		}
	}

	const message = extractString(body.message ?? body.error);
	return message;
}

function extractNestedErrorMessage(value: unknown): string | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const message = extractString((value as Record<string, unknown>).message ?? (value as Record<string, unknown>).error);
	return message;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
