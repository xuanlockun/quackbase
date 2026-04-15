import { createHash } from "node:crypto";

const DEFAULT_D1_DATABASE_ID = "d0365841-9c7f-4cad-b9f0-6ee5c1bf6810";
const D1_EXPORT_POLL_INTERVAL_MS = 1000;
const D1_EXPORT_MAX_ATTEMPTS = 30;
const D1_IMPORT_POLL_INTERVAL_MS = 1000;
const D1_IMPORT_MAX_ATTEMPTS = 60;

export interface D1BackupConfig {
	accountId: string;
	apiToken: string;
	databaseId: string;
}

export interface D1BackupExportOptions {
	tables?: string[];
	noData?: boolean;
	noSchema?: boolean;
}

export interface D1BackupResult {
	downloadUrl: string;
	filename: string;
}

export interface D1BackupImportResult {
	finalBookmark: string | null;
	filename: string | null;
	status: "complete" | "error";
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

export async function exportD1SqlBackup(
	config: D1BackupConfig,
	options: D1BackupExportOptions = {},
): Promise<D1BackupResult> {
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/export`;
	let bookmark: string | null = null;
	const tables = normalizeTableNames(options.tables);

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
				...(tables.length > 0 || options.noData || options.noSchema
					? {
							dump_options: {
								...(tables.length > 0 ? { tables } : {}),
								...(options.noData ? { no_data: true } : {}),
								...(options.noSchema ? { no_schema: true } : {}),
							},
					  }
					: {}),
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

export async function importD1SqlBackup(
	config: D1BackupConfig,
	sqlFile: File,
): Promise<D1BackupImportResult> {
	if (!sqlFile || sqlFile.size <= 0) {
		throw new Error("Please choose a SQL file to import.");
	}

	const fileBytes = new Uint8Array(await sqlFile.arrayBuffer());
	const etag = createHash("md5").update(fileBytes).digest("hex");
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/import`;
	const headers = {
		Authorization: `Bearer ${config.apiToken}`,
		"Content-Type": "application/json",
	};

	const initResult = await postD1Import(endpoint, headers, {
		action: "init",
		etag,
	});
	const uploadUrl = extractString(initResult.upload_url);
	const filename = extractString(initResult.filename);
	if (!uploadUrl || !filename) {
		throw new Error("D1 import did not return an upload URL.");
	}

	const uploadResponse = await fetch(uploadUrl, {
		method: "PUT",
		headers: {
			"Content-Type": sqlFile.type || "application/sql",
		},
		body: fileBytes,
	});
	if (!uploadResponse.ok) {
		throw new Error("Failed to upload the SQL file for import.");
	}

	const uploadedEtag = extractString(uploadResponse.headers.get("ETag"))?.replace(/^"|"$/g, "") ?? null;
	if (uploadedEtag && uploadedEtag.toLowerCase() !== etag.toLowerCase()) {
		throw new Error("SQL upload verification failed. Please try again.");
	}

	const ingestResult = await postD1Import(endpoint, headers, {
		action: "ingest",
		etag,
		filename,
	});
	const ingestBookmark = extractString(ingestResult.at_bookmark);
	const ingestNormalized = normalizeImportResult(ingestResult);

	if (ingestNormalized.status === "complete") {
		return {
			finalBookmark: extractString(ingestNormalized.finalBookmark),
			filename,
			status: "complete",
		};
	}

	if (ingestNormalized.status === "error") {
		throw new Error(ingestNormalized.message ?? "Unable to import the SQL file.");
	}

	const bookmark = ingestBookmark;
	if (!bookmark) {
		throw new Error("D1 import did not return a bookmark for polling.");
	}

	let currentBookmark = bookmark;
	for (let attempt = 0; attempt < D1_IMPORT_MAX_ATTEMPTS; attempt += 1) {
		await sleep(D1_IMPORT_POLL_INTERVAL_MS);
		const pollResult = await postD1Import(endpoint, headers, {
			action: "poll",
			current_bookmark: currentBookmark,
		});
		const normalized = normalizeImportResult(pollResult);

		if (normalized.status === "complete") {
			return {
				finalBookmark: normalized.finalBookmark,
				filename,
				status: "complete",
			};
		}

		if (normalized.status === "error") {
			throw new Error(normalized.message ?? "Unable to import the SQL file.");
		}

		const nextBookmark = extractString(normalized.bookmark);
		if (nextBookmark) {
			currentBookmark = nextBookmark;
		}
	}

	throw new Error("SQL import is taking too long. Please try again.");
}

export async function listD1TableNames(db: D1Database): Promise<string[]> {
	const result = await db
		.prepare(
			`SELECT name
			FROM sqlite_master
			WHERE type = 'table'
				AND name NOT LIKE 'sqlite_%'
			ORDER BY name`,
		)
		.all<{ name: string }>();

	return (result.results ?? [])
		.map((row) => row.name?.trim())
		.filter((name): name is string => Boolean(name));
}

async function postD1Import(
	endpoint: string,
	headers: Record<string, string>,
	body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
	if (!response.ok || json.success === false) {
		throw new Error(extractCloudflareError(json) ?? "Unable to import SQL into D1.");
	}

	return json;
}

function normalizeImportResult(body: Record<string, unknown>): {
	status: string;
	message: string | null;
	finalBookmark: string | null;
	bookmark: string | null;
} {
	const result = (body.result ?? body) as Record<string, unknown>;
	const nested = (result.result ?? result) as Record<string, unknown>;
	const status =
		String(result.status ?? nested.status ?? body.status ?? "").trim().toLowerCase() || "processing";
	const message =
		extractString(result.error ?? nested.error ?? body.error) ||
		extractNestedErrorMessage(body.error) ||
		extractString(result.message ?? nested.message);
	const finalBookmark = extractString(result.final_bookmark ?? nested.final_bookmark);
	const bookmark = extractString(result.at_bookmark ?? nested.at_bookmark ?? body.at_bookmark);

	return { status, message, finalBookmark, bookmark };
}

function normalizeTableNames(values?: string[]): string[] {
	if (!values) {
		return [];
	}

	const unique = new Set<string>();
	for (const value of values) {
		if (typeof value !== "string") {
			continue;
		}

		const normalized = value.trim();
		if (!normalized) {
			continue;
		}
		unique.add(normalized);
	}

	return [...unique];
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
