export type AdminSecretType =
	| "cloudflare_api_access_token"
	| "media_s3_access_key_id"
	| "media_s3_secret_access_key";

export interface AdminSecretRecord {
	id: number;
	secretType: AdminSecretType;
	label: string;
	maskedValue: string;
	valueLast4: string;
	createdAt: Date;
	updatedAt: Date;
}

interface AdminSecretRow {
	id: number;
	secret_type: string;
	label: string;
	encrypted_value: string;
	iv: string;
	value_last4: string;
	created_at: string;
	updated_at: string;
}

interface SecretsEnv {
	JWT_SECRET?: string;
	SECRETS_ENCRYPTION_KEY?: string;
}

const DEFAULT_SECRET_TYPE: AdminSecretType = "cloudflare_api_access_token";
const SECRET_KEY_ALGORITHM = "AES-GCM";
const MASKED_SECRET_PREFIX = "****";
const ADMIN_SECRET_TYPES: AdminSecretType[] = [
	"cloudflare_api_access_token",
	"media_s3_access_key_id",
	"media_s3_secret_access_key",
];
const ADMIN_SECRET_TYPE_LABELS: Record<AdminSecretType, string> = {
	cloudflare_api_access_token: "Cloudflare API Access Token",
	media_s3_access_key_id: "Media S3 Access Key ID",
	media_s3_secret_access_key: "Media S3 Secret Access Key",
};

export async function ensureSecretTables(db: D1Database): Promise<void> {
	await migrateLegacyAdminSecretsTable(db);

	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS admin_secrets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				secret_type TEXT NOT NULL CHECK (secret_type IN ('cloudflare_api_access_token', 'media_s3_access_key_id', 'media_s3_secret_access_key')),
				label TEXT NOT NULL,
				encrypted_value TEXT NOT NULL,
				iv TEXT NOT NULL,
				value_last4 TEXT NOT NULL DEFAULT '',
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_admin_secrets_created_at
			ON admin_secrets (created_at DESC, id DESC)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_admin_secrets_type_updated_at
			ON admin_secrets (secret_type, updated_at DESC, id DESC)`,
		),
	]);
}

export async function listAdminSecrets(
	db: D1Database,
	options?: { secretTypes?: AdminSecretType[] },
): Promise<AdminSecretRecord[]> {
	await ensureSecretTables(db);
	const secretTypes = options?.secretTypes?.length ? [...new Set(options.secretTypes)] : [];
	const query =
		secretTypes.length > 0
			? `SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
			FROM admin_secrets
			WHERE secret_type IN (${secretTypes.map((_, index) => `?${index + 1}`).join(", ")})
			ORDER BY datetime(created_at) DESC, id DESC`
			: `SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
			FROM admin_secrets
			ORDER BY datetime(created_at) DESC, id DESC`;

	const statement = db.prepare(query);
	const result =
		secretTypes.length > 0
			? await statement.bind(...secretTypes).all<AdminSecretRow>()
			: await statement.all<AdminSecretRow>();

	return (result.results ?? []).map(toAdminSecretRecord);
}

export async function createAdminSecret(
	db: D1Database,
	input: { secretValue: string; label?: string; secretType?: AdminSecretType },
	env: SecretsEnv,
): Promise<number> {
	await ensureSecretTables(db);
	const secretValue = input.secretValue.trim();
	if (!secretValue) {
		throw new Error("Secret value is required.");
	}

	const secretType = input.secretType ?? DEFAULT_SECRET_TYPE;
	const { key } = await resolveEncryptionKey(env);
	const encrypted = await encryptSecret(secretValue, key);
	const last4 = secretValue.slice(-4);
	const label = input.label?.trim() || getDefaultSecretLabel(secretType);

	const result = await db
		.prepare(
			`INSERT INTO admin_secrets (secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		)
		.bind(secretType, label, encrypted.ciphertext, encrypted.iv, last4)
		.run();

	return Number(result.meta.last_row_id ?? 0);
}

export async function upsertAdminSecret(
	db: D1Database,
	input: { secretValue: string; label?: string; secretType: AdminSecretType },
	env: SecretsEnv,
): Promise<number> {
	await ensureSecretTables(db);
	const secretValue = input.secretValue.trim();
	if (!secretValue) {
		throw new Error("Secret value is required.");
	}

	const existing = await getLatestAdminSecretRecordByType(db, input.secretType);
	if (!existing) {
		return createAdminSecret(db, input, env);
	}

	const { key } = await resolveEncryptionKey(env);
	const encrypted = await encryptSecret(secretValue, key);
	const last4 = secretValue.slice(-4);
	const label = input.label?.trim() || getDefaultSecretLabel(input.secretType);

	await db
		.prepare(
			`UPDATE admin_secrets
			SET label = ?2,
				encrypted_value = ?3,
				iv = ?4,
				value_last4 = ?5,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?1`,
		)
		.bind(existing.id, label, encrypted.ciphertext, encrypted.iv, last4)
		.run();

	return existing.id;
}

export async function deleteAdminSecret(db: D1Database, id: number): Promise<void> {
	await ensureSecretTables(db);
	await db.prepare("DELETE FROM admin_secrets WHERE id = ?1").bind(id).run();
}

export async function getLatestAdminSecretRecordByType(
	db: D1Database,
	secretType: AdminSecretType,
): Promise<AdminSecretRecord | null> {
	await ensureSecretTables(db);
	const row = await db
		.prepare(
			`SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
			FROM admin_secrets
			WHERE secret_type = ?1
			ORDER BY datetime(updated_at) DESC, id DESC
			LIMIT 1`,
		)
		.bind(secretType)
		.first<AdminSecretRow>();

	return row ? toAdminSecretRecord(row) : null;
}

export async function getAdminSecretValue(
	db: D1Database,
	id: number,
	env: SecretsEnv,
): Promise<string | null> {
	await ensureSecretTables(db);
	const row = await db
		.prepare(
			`SELECT encrypted_value, iv
			FROM admin_secrets
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(id)
		.first<{ encrypted_value: string; iv: string }>();

	if (!row) {
		return null;
	}

	const { key } = await resolveEncryptionKey(env);
	return decryptSecret(row.encrypted_value, row.iv, key);
}

export async function getAdminSecretValueByType(
	db: D1Database,
	secretType: AdminSecretType,
	env: SecretsEnv,
): Promise<string | null> {
	await ensureSecretTables(db);
	const row = await db
		.prepare(
			`SELECT encrypted_value, iv
			FROM admin_secrets
			WHERE secret_type = ?1
			ORDER BY datetime(updated_at) DESC, id DESC
			LIMIT 1`,
		)
		.bind(secretType)
		.first<{ encrypted_value: string; iv: string }>();

	if (!row) {
		return null;
	}

	const { key } = await resolveEncryptionKey(env);
	return decryptSecret(row.encrypted_value, row.iv, key);
}

function toAdminSecretRecord(row: AdminSecretRow): AdminSecretRecord {
	return {
		id: row.id,
		secretType: normalizeSecretType(row.secret_type),
		label: row.label,
		maskedValue: maskSecretValue(row.value_last4),
		valueLast4: row.value_last4,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at),
	};
}

function normalizeSecretType(value: string): AdminSecretType {
	return ADMIN_SECRET_TYPES.includes(value as AdminSecretType)
		? (value as AdminSecretType)
		: DEFAULT_SECRET_TYPE;
}

function maskSecretValue(valueLast4: string): string {
	const suffix = valueLast4.trim();
	if (!suffix) {
		return MASKED_SECRET_PREFIX;
	}

	return `${MASKED_SECRET_PREFIX} ${suffix}`;
}

function getDefaultSecretLabel(secretType: AdminSecretType): string {
	return ADMIN_SECRET_TYPE_LABELS[secretType] ?? ADMIN_SECRET_TYPE_LABELS[DEFAULT_SECRET_TYPE];
}

async function migrateLegacyAdminSecretsTable(db: D1Database): Promise<void> {
	const table = await db
		.prepare(
			`SELECT sql
			FROM sqlite_master
			WHERE type = 'table' AND name = 'admin_secrets'
			LIMIT 1`,
		)
		.first<{ sql: string | null }>();

	const createSql = table?.sql ?? "";
	if (!createSql.includes("CHECK (secret_type = 'cloudflare_api_access_token')")) {
		return;
	}

	await db.batch([
		db.prepare(`DROP INDEX IF EXISTS idx_admin_secrets_created_at`),
		db.prepare(`ALTER TABLE admin_secrets RENAME TO admin_secrets_legacy`),
		db.prepare(
			`CREATE TABLE admin_secrets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				secret_type TEXT NOT NULL CHECK (secret_type IN ('cloudflare_api_access_token', 'media_s3_access_key_id', 'media_s3_secret_access_key')),
				label TEXT NOT NULL,
				encrypted_value TEXT NOT NULL,
				iv TEXT NOT NULL,
				value_last4 TEXT NOT NULL DEFAULT '',
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`INSERT INTO admin_secrets (id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at)
			SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
			FROM admin_secrets_legacy`,
		),
		db.prepare(`DROP TABLE admin_secrets_legacy`),
	]);
}

async function resolveEncryptionKey(env: SecretsEnv): Promise<CryptoKey> {
	const rawKey = (env.SECRETS_ENCRYPTION_KEY || env.JWT_SECRET || "").trim();
	if (!rawKey) {
		throw new Error("Secret encryption key is not configured.");
	}

	const keyMaterial = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawKey));
	return crypto.subtle.importKey("raw", keyMaterial, SECRET_KEY_ALGORITHM, false, ["encrypt", "decrypt"]);
}

async function encryptSecret(value: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: SECRET_KEY_ALGORITHM, iv },
		key,
		new TextEncoder().encode(value),
	);

	return {
		ciphertext: toBase64(new Uint8Array(ciphertext)),
		iv: toBase64(iv),
	};
}

async function decryptSecret(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
	const plaintext = await crypto.subtle.decrypt(
		{ name: SECRET_KEY_ALGORITHM, iv: fromBase64(iv) },
		key,
		fromBase64(ciphertext),
	);
	return new TextDecoder().decode(plaintext);
}

function toBase64(bytes: Uint8Array): string {
	let binary = "";
	for (let index = 0; index < bytes.length; index += 1) {
		binary += String.fromCharCode(bytes[index]);
	}
	return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}
