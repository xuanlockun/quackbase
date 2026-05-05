const RUNTIME_SECRET_KEY = "jwt_signing_key";

export async function ensureRuntimeSecretTable(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS runtime_secrets (
				secret_key TEXT PRIMARY KEY,
				secret_value TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_runtime_secrets_updated_at ON runtime_secrets (updated_at DESC)`),
	]);
}

export async function getOrCreateJwtSigningKey(db: D1Database): Promise<string> {
	await ensureRuntimeSecretTable(db);

	const existing = await db
		.prepare(`SELECT secret_value as secretValue FROM runtime_secrets WHERE secret_key = ?1 LIMIT 1`)
		.bind(RUNTIME_SECRET_KEY)
		.first<{ secretValue: string }>();
	if (existing?.secretValue.trim()) {
		return existing.secretValue.trim();
	}

	const secretValue = generateRandomSecret();
	await db
		.prepare(
			`INSERT INTO runtime_secrets (secret_key, secret_value, created_at, updated_at)
			VALUES (?1, ?2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			ON CONFLICT(secret_key) DO UPDATE SET
				secret_value = excluded.secret_value,
				updated_at = CURRENT_TIMESTAMP`,
		)
		.bind(RUNTIME_SECRET_KEY, secretValue)
		.run();

	return secretValue;
}

function generateRandomSecret(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

