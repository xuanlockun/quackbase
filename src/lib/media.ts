export type MediaStorageProvider = "r2" | "s3" | "unconfigured";

export interface MediaAsset {
	id: number;
	storageProvider: Exclude<MediaStorageProvider, "unconfigured">;
	objectKey: string;
	fileName: string;
	mimeType: string;
	sizeBytes: number;
	publicUrl: string;
	createdAt: Date;
	updatedAt: Date;
}

interface MediaAssetRow {
	id: number;
	storage_provider: string;
	object_key: string;
	file_name: string;
	mime_type: string;
	size_bytes: number;
	public_url: string;
	created_at: string;
	updated_at: string;
}

interface R2StorageBinding {
	put: (key: string, value: Blob, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
	get: (key: string) => Promise<R2ObjectBody | R2Object | null>;
	delete: (keys: string | string[]) => Promise<void>;
}

interface S3StorageConfig {
	endpoint: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	forcePathStyle: boolean;
	publicBaseUrl: string;
}

type StorageBackend =
	| {
			provider: "r2";
			bucket: R2StorageBinding;
			publicBaseUrl: string;
	  }
	| {
			provider: "s3";
			config: S3StorageConfig;
	  }
	| {
			provider: "unconfigured";
	  };

export interface MediaStorageStatus {
	provider: MediaStorageProvider;
	isConfigured: boolean;
	label: string;
	details: string;
	publicBaseUrl: string;
}

const DEFAULT_MEDIA_PREFIX = "media";

export async function ensureMediaTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS media_assets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				storage_provider TEXT NOT NULL CHECK (storage_provider IN ('r2', 's3')),
				object_key TEXT NOT NULL UNIQUE,
				file_name TEXT NOT NULL,
				mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
				size_bytes INTEGER NOT NULL DEFAULT 0,
				public_url TEXT NOT NULL DEFAULT '',
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
			ON media_assets (created_at DESC, id DESC)`,
		),
	]);
}

export async function listMediaAssets(db: D1Database): Promise<MediaAsset[]> {
	await ensureMediaTables(db);
	const result = await db
		.prepare(
			`SELECT id, storage_provider, object_key, file_name, mime_type, size_bytes, public_url, created_at, updated_at
			FROM media_assets
			ORDER BY datetime(created_at) DESC, id DESC`,
		)
		.all<MediaAssetRow>();

	return (result.results ?? []).map(toMediaAsset);
}

export async function getMediaAssetById(db: D1Database, id: number): Promise<MediaAsset | null> {
	await ensureMediaTables(db);
	const row = await db
		.prepare(
			`SELECT id, storage_provider, object_key, file_name, mime_type, size_bytes, public_url, created_at, updated_at
			FROM media_assets
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<MediaAssetRow>();

	return row ? toMediaAsset(row) : null;
}

export async function createMediaAsset(
	db: D1Database,
	input: {
		storageProvider: Exclude<MediaStorageProvider, "unconfigured">;
		objectKey: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
		publicUrl: string;
	},
): Promise<MediaAsset> {
	await ensureMediaTables(db);
	const result = await db
		.prepare(
			`INSERT INTO media_assets (
				storage_provider,
				object_key,
				file_name,
				mime_type,
				size_bytes,
				public_url,
				created_at,
				updated_at
			)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.storageProvider,
			input.objectKey,
			input.fileName,
			input.mimeType,
			input.sizeBytes,
			input.publicUrl,
		)
		.run();

	const id = Number(result.meta.last_row_id ?? 0);
	const asset = await getMediaAssetById(db, id);
	if (!asset) {
		throw new Error("Media asset could not be created.");
	}
	return asset;
}

export async function deleteMediaAsset(db: D1Database, id: number): Promise<MediaAsset | null> {
	await ensureMediaTables(db);
	const asset = await getMediaAssetById(db, id);
	if (!asset) {
		return null;
	}

	await db.prepare("DELETE FROM media_assets WHERE id = ?1").bind(id).run();
	return asset;
}

export function getMediaStorageStatus(locals: App.Locals): MediaStorageStatus {
	const backend = resolveStorageBackend(locals);
	if (backend.provider === "unconfigured") {
		return {
			provider: "unconfigured",
			isConfigured: false,
			label: "Not configured",
			details: "Set R2_BUCKET or S3_* environment variables to enable uploads.",
			publicBaseUrl: "",
		};
	}

	if (backend.provider === "r2") {
		return {
			provider: "r2",
			isConfigured: true,
			label: "Cloudflare R2",
			details: "Uploads use the R2 bucket binding on the Worker runtime.",
			publicBaseUrl: backend.publicBaseUrl,
		};
	}

	return {
		provider: "s3",
		isConfigured: true,
		label: "S3-compatible storage",
		details: `Uploads use ${backend.config.endpoint} / ${backend.config.bucket}.`,
		publicBaseUrl: backend.config.publicBaseUrl,
	};
}

export async function uploadMediaObject(
	locals: App.Locals,
	file: File,
): Promise<{
	storageProvider: Exclude<MediaStorageProvider, "unconfigured">;
	objectKey: string;
	publicUrl: string;
}> {
	const backend = resolveStorageBackend(locals);
	if (backend.provider === "unconfigured") {
		throw new Error("Media storage is not configured.");
	}

	const fileName = sanitizeMediaFileName(file.name || "upload");
	const objectKey = makeMediaObjectKey(fileName);
	const publicUrl = buildPublicUrl(backend, objectKey);

	if (backend.provider === "r2") {
		await backend.bucket.put(objectKey, file, {
			httpMetadata: { contentType: file.type || "application/octet-stream" },
		});
	} else {
		await putS3Object(backend.config, objectKey, file);
	}

	return {
		storageProvider: backend.provider,
		objectKey,
		publicUrl,
	};
}

export async function deleteMediaObject(locals: App.Locals, objectKey: string): Promise<void> {
	const backend = resolveStorageBackend(locals);
	if (backend.provider === "unconfigured") {
		throw new Error("Media storage is not configured.");
	}

	if (backend.provider === "r2") {
		await backend.bucket.delete(objectKey);
		return;
	}

	await deleteS3Object(backend.config, objectKey);
}

export async function getMediaObjectResponse(
	locals: App.Locals,
	asset: MediaAsset,
): Promise<Response | null> {
	const backend = resolveStorageBackend(locals);
	if (backend.provider === "unconfigured") {
		return null;
	}

	if (backend.provider === "r2") {
		const object = await backend.bucket.get(asset.objectKey);
		if (!object) {
			return null;
		}

		return new Response(object.body, {
			headers: buildMediaResponseHeaders(asset.fileName, asset.mimeType, String((object as R2Object).size ?? asset.sizeBytes)),
		});
	}

	const response = await fetchS3Object(backend.config, asset.objectKey);
	if (!response.ok || !response.body) {
		return null;
	}

	return new Response(response.body, {
		status: response.status,
		headers: buildMediaResponseHeaders(
			asset.fileName,
			response.headers.get("content-type") ?? asset.mimeType,
			response.headers.get("content-length") ?? String(asset.sizeBytes),
		),
	});
}

function toMediaAsset(row: MediaAssetRow): MediaAsset {
	return {
		id: row.id,
		storageProvider: row.storage_provider === "s3" ? "s3" : "r2",
		objectKey: row.object_key,
		fileName: row.file_name,
		mimeType: row.mime_type,
		sizeBytes: Number(row.size_bytes ?? 0),
		publicUrl: row.public_url,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
	};
}

function resolveStorageBackend(locals: App.Locals): StorageBackend {
	const env = locals.runtime.env as Record<string, unknown>;
	const r2Bucket = env.R2_BUCKET as R2StorageBinding | undefined;
	if (r2Bucket) {
		return {
			provider: "r2",
			bucket: r2Bucket,
			publicBaseUrl: normalizeBaseUrl(
				typeof env.R2_PUBLIC_BASE_URL === "string"
					? env.R2_PUBLIC_BASE_URL
					: typeof env.MEDIA_PUBLIC_BASE_URL === "string"
						? env.MEDIA_PUBLIC_BASE_URL
						: "",
			),
		};
	}

	const endpoint = typeof env.S3_ENDPOINT === "string" ? env.S3_ENDPOINT.trim() : "";
	const bucket = typeof env.S3_BUCKET === "string" ? env.S3_BUCKET.trim() : "";
	const accessKeyId = typeof env.S3_ACCESS_KEY_ID === "string" ? env.S3_ACCESS_KEY_ID.trim() : "";
	const secretAccessKey = typeof env.S3_SECRET_ACCESS_KEY === "string" ? env.S3_SECRET_ACCESS_KEY.trim() : "";
	if (endpoint && bucket && accessKeyId && secretAccessKey) {
		return {
			provider: "s3",
			config: {
				endpoint: normalizeBaseUrl(endpoint),
				bucket,
				accessKeyId,
				secretAccessKey,
				region: typeof env.S3_REGION === "string" && env.S3_REGION.trim() ? env.S3_REGION.trim() : "auto",
				forcePathStyle:
					typeof env.S3_FORCE_PATH_STYLE === "string"
						? ["1", "true", "yes"].includes(env.S3_FORCE_PATH_STYLE.trim().toLowerCase())
						: true,
				publicBaseUrl: normalizeBaseUrl(
					typeof env.S3_PUBLIC_BASE_URL === "string"
						? env.S3_PUBLIC_BASE_URL
						: typeof env.MEDIA_PUBLIC_BASE_URL === "string"
							? env.MEDIA_PUBLIC_BASE_URL
							: "",
				),
			},
		};
	}

	return { provider: "unconfigured" };
}

function buildPublicUrl(backend: StorageBackend, objectKey: string): string {
	if (backend.provider === "unconfigured") {
		return "";
	}

	const baseUrl = backend.provider === "r2" ? backend.publicBaseUrl : backend.config.publicBaseUrl;
	return baseUrl ? joinUrl(baseUrl, objectKey) : "";
}

async function putS3Object(config: S3StorageConfig, objectKey: string, file: File): Promise<void> {
	const body = await file.arrayBuffer();
	const url = buildS3ObjectUrl(config, objectKey);
	const contentType = file.type || "application/octet-stream";
	const headers = new Headers({
		"content-type": contentType,
		"x-amz-content-sha256": await sha256Hex(body),
		"x-amz-date": getAmzDate(),
	});
	const signed = await signS3Request(config, "PUT", url, headers, headers.get("x-amz-content-sha256") ?? "", body);
	const response = await fetch(url, {
		method: "PUT",
		headers: signed,
		body,
	});
	if (!response.ok) {
		throw new Error(`Failed to upload media to S3 (${response.status}).`);
	}
}

async function deleteS3Object(config: S3StorageConfig, objectKey: string): Promise<void> {
	const url = buildS3ObjectUrl(config, objectKey);
	const headers = new Headers({
		"x-amz-content-sha256": await sha256Hex(""),
		"x-amz-date": getAmzDate(),
	});
	const signed = await signS3Request(config, "DELETE", url, headers, headers.get("x-amz-content-sha256") ?? "", "");
	const response = await fetch(url, {
		method: "DELETE",
		headers: signed,
	});
	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to delete media from S3 (${response.status}).`);
	}
}

async function fetchS3Object(config: S3StorageConfig, objectKey: string): Promise<Response> {
	const url = buildS3ObjectUrl(config, objectKey);
	const headers = new Headers({
		"x-amz-content-sha256": await sha256Hex(""),
		"x-amz-date": getAmzDate(),
	});
	const signed = await signS3Request(config, "GET", url, headers, headers.get("x-amz-content-sha256") ?? "", "");
	return fetch(url, {
		method: "GET",
		headers: signed,
	});
}

function buildS3ObjectUrl(config: S3StorageConfig, objectKey: string): URL {
	const base = normalizeBaseUrl(config.endpoint);
	const url = new URL(base);
	const keyPath = objectKey
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");

	if (config.forcePathStyle || !url.hostname.includes(config.bucket)) {
		url.pathname = `${trimSlashes(url.pathname)}/${encodeURIComponent(config.bucket)}/${keyPath}`;
	} else {
		url.hostname = `${config.bucket}.${url.hostname}`;
		url.pathname = `${trimSlashes(url.pathname)}/${keyPath}`;
	}

	return url;
}

async function signS3Request(
	config: S3StorageConfig,
	method: string,
	url: URL,
	headers: Headers,
	payloadHash: string,
	body: ArrayBuffer | string,
): Promise<Headers> {
	const amzDate = headers.get("x-amz-date") ?? getAmzDate();
	const dateStamp = amzDate.slice(0, 8);
	const canonicalHeadersList = Array.from(headers.entries())
		.map(([key, value]) => [key.toLowerCase(), value.trim()] as const)
		.sort(([left], [right]) => left.localeCompare(right));
	const canonicalHeaders = canonicalHeadersList.map(([key, value]) => `${key}:${value}\n`).join("");
	const signedHeaders = canonicalHeadersList.map(([key]) => key).join(";");
	const canonicalQueryString = buildCanonicalQueryString(url.searchParams);
	const canonicalUri = buildCanonicalUri(url.pathname);
	const canonicalRequest = [
		method.toUpperCase(),
		canonicalUri,
		canonicalQueryString,
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join("\n");
	const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		await sha256Hex(canonicalRequest),
	].join("\n");
	const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp, config.region, "s3");
	const signature = await hmacHex(signingKey, stringToSign);
	const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	const signedHeadersOut = new Headers(headers);
	signedHeadersOut.set("Authorization", authorization);
	if (typeof body === "string") {
		signedHeadersOut.set("content-length", String(new TextEncoder().encode(body).length));
	}
	return signedHeadersOut;
}

async function getSignatureKey(secretAccessKey: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
	const kDate = await hmacRaw(`AWS4${secretAccessKey}`, dateStamp);
	const kRegion = await hmacRaw(kDate, regionName);
	const kService = await hmacRaw(kRegion, serviceName);
	return hmacRaw(kService, "aws4_request");
}

async function hmacRaw(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		typeof key === "string" ? new TextEncoder().encode(key) : key,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key: ArrayBuffer | string, data: string): Promise<string> {
	return bufferToHex(await hmacRaw(key, data));
}

async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
	const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
	return bufferToHex(await crypto.subtle.digest("SHA-256", input));
}

function bufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function buildCanonicalQueryString(params: URLSearchParams): string {
	return Array.from(params.entries())
		.map(([key, value]) => [encodeURIComponent(key), encodeURIComponent(value)] as const)
		.sort(([leftKey, leftValue], [rightKey, rightValue]) =>
			leftKey === rightKey ? leftValue.localeCompare(rightValue) : leftKey.localeCompare(rightKey),
		)
		.map(([key, value]) => `${key}=${value}`)
		.join("&");
}

function buildCanonicalUri(pathname: string): string {
	const trimmed = pathname || "/";
	return trimmed
		.split("/")
		.map((segment, index) => {
			if (index === 0) {
				return "";
			}
			return encodeURIComponent(segment).replaceAll("%2F", "/");
		})
		.join("/");
}

function buildMediaResponseHeaders(fileName: string, mimeType: string, size: string): Headers {
	const headers = new Headers();
	headers.set("Content-Type", mimeType || "application/octet-stream");
	headers.set("Content-Length", size);
	headers.set("Content-Disposition", `inline; filename="${sanitizeHeaderValue(fileName)}"`);
	headers.set("Cache-Control", "no-store");
	return headers;
}

function makeMediaObjectKey(fileName: string): string {
	const now = new Date();
	const year = String(now.getUTCFullYear());
	const month = String(now.getUTCMonth() + 1).padStart(2, "0");
	const id = crypto.randomUUID();
	return `${DEFAULT_MEDIA_PREFIX}/${year}/${month}/${id}-${fileName}`;
}

function sanitizeMediaFileName(fileName: string): string {
	const normalized = fileName
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	return normalized || "upload";
}

function sanitizeHeaderValue(value: string): string {
	return value.replaceAll('"', "'");
}

function normalizeBaseUrl(value: string): string {
	return value.trim().replace(/\/+$/, "");
}

function joinUrl(base: string, path: string): string {
	const normalizedBase = normalizeBaseUrl(base);
	const normalizedPath = path
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	return `${normalizedBase}/${normalizedPath}`;
}

function trimSlashes(value: string): string {
	return value.replace(/^\/+|\/+$/g, "");
}
