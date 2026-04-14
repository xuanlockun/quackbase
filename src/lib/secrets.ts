export type AdminSecretType = "cloudflare_api_access_token";

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
const DEFAULT_SECRET_LABEL = "Cloudflare API Access Token";
const SECRET_KEY_ALGORITHM = "AES-GCM";

export async function ensureSecretTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS admin_secrets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				secret_type TEXT NOT NULL CHECK (secret_type = 'cloudflare_api_access_token'),
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
	]);
}

export async function listAdminSecrets(db: D1Database): Promise<AdminSecretRecord[]> {
	await ensureSecretTables(db);
	const result = await db
		.prepare(
			`SELECT id, secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at
			FROM admin_secrets
			ORDER BY datetime(created_at) DESC, id DESC`,
		)
		.all<AdminSecretRow>();

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

	const { key } = await resolveEncryptionKey(env);
	const encrypted = await encryptSecret(secretValue, key);
	const last4 = secretValue.slice(-4);
	const label = input.label?.trim() || DEFAULT_SECRET_LABEL;
	const secretType = input.secretType ?? DEFAULT_SECRET_TYPE;

	const result = await db
		.prepare(
			`INSERT INTO admin_secrets (secret_type, label, encrypted_value, iv, value_last4, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		)
		.bind(secretType, label, encrypted.ciphertext, encrypted.iv, last4)
		.run();

	return Number(result.meta.last_row_id ?? 0);
}

export async function deleteAdminSecret(db: D1Database, id: number): Promise<void> {
	await ensureSecretTables(db);
	await db.prepare("DELETE FROM admin_secrets WHERE id = ?1").bind(id).run();
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
	return DEFAULT_SECRET_TYPE;
}

function maskSecretValue(valueLast4: string): string {
	const suffix = valueLast4.trim();
	if (!suffix) {
		return "••••";
	}

	return `•••• ${suffix}`;
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
