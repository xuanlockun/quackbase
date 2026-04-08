export interface LanguageRow {
	id: number;
	code: string;
	name: string;
	enabled: boolean;
	isDefault: boolean;
}

/** Request-scoped catalog for routing, fallback, and the public language switch. */
export interface LanguageCatalogState {
	defaultLanguageCode: string;
	enabledLanguages: ReadonlyArray<{ code: string; label: string }>;
}

/** Used when D1 is unavailable or the catalog failed to load. */
export const FALLBACK_LANGUAGE_CATALOG: LanguageCatalogState = {
	defaultLanguageCode: "en",
	enabledLanguages: [
		{ code: "en", label: "English" },
		{ code: "vi", label: "Vietnamese" },
	],
};

const CODE_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

export function isValidLanguageCode(code: string): boolean {
	return CODE_PATTERN.test(code.trim());
}

export async function ensureLanguageTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS languages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				code TEXT NOT NULL UNIQUE,
				name TEXT NOT NULL,
				enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
				is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1))
			)`,
		),
		db.prepare(`CREATE INDEX IF NOT EXISTS idx_languages_enabled ON languages (enabled)`),
	]);

	const count = await db.prepare(`SELECT COUNT(*) as c FROM languages`).first<{ c: number }>();
	if ((count?.c ?? 0) === 0) {
		await db.batch([
			db
				.prepare(
					`INSERT INTO languages (code, name, enabled, is_default) VALUES ('en', 'English', 1, 1)`,
				),
			db
				.prepare(
					`INSERT INTO languages (code, name, enabled, is_default) VALUES ('vi', 'Vietnamese', 1, 0)`,
				),
		]);
	}
}

function rowFromDb(row: {
	id: number;
	code: string;
	name: string;
	enabled: number;
	is_default: number;
}): LanguageRow {
	return {
		id: row.id,
		code: row.code,
		name: row.name,
		enabled: row.enabled === 1,
		isDefault: row.is_default === 1,
	};
}

export async function listAllLanguages(db: D1Database): Promise<LanguageRow[]> {
	await ensureLanguageTables(db);
	const result = await db
		.prepare(`SELECT id, code, name, enabled, is_default FROM languages ORDER BY name COLLATE NOCASE ASC`)
		.all<{ id: number; code: string; name: string; enabled: number; is_default: number }>();
	return (result.results ?? []).map(rowFromDb);
}

export async function listEnabledLanguages(db: D1Database): Promise<LanguageRow[]> {
	await ensureLanguageTables(db);
	const result = await db
		.prepare(
			`SELECT id, code, name, enabled, is_default FROM languages WHERE enabled = 1 ORDER BY name COLLATE NOCASE ASC`,
		)
		.all<{ id: number; code: string; name: string; enabled: number; is_default: number }>();
	return (result.results ?? []).map(rowFromDb);
}

export async function getDefaultLanguageCode(db: D1Database): Promise<string> {
	await ensureLanguageTables(db);
	const row = await db
		.prepare(`SELECT code FROM languages WHERE is_default = 1 LIMIT 1`)
		.first<{ code: string }>();
	if (row?.code) {
		return row.code;
	}

	const fallback = await db
		.prepare(`SELECT code FROM languages WHERE enabled = 1 ORDER BY name COLLATE NOCASE ASC LIMIT 1`)
		.first<{ code: string }>();
	return fallback?.code ?? FALLBACK_LANGUAGE_CATALOG.defaultLanguageCode;
}

export async function loadLanguageCatalog(db: D1Database): Promise<LanguageCatalogState> {
	const [defaultLanguageCode, enabled] = await Promise.all([getDefaultLanguageCode(db), listEnabledLanguages(db)]);

	return {
		defaultLanguageCode,
		enabledLanguages: enabled.map((lang) => ({ code: lang.code, label: lang.name })),
	};
}

export async function getLanguageByCode(db: D1Database, code: string): Promise<LanguageRow | null> {
	await ensureLanguageTables(db);
	const row = await db
		.prepare(`SELECT id, code, name, enabled, is_default FROM languages WHERE code = ?1 LIMIT 1`)
		.bind(code.trim())
		.first<{ id: number; code: string; name: string; enabled: number; is_default: number }>();
	return row ? rowFromDb(row) : null;
}

export interface CreateLanguageInput {
	code: string;
	name: string;
	enabled?: boolean;
	isDefault?: boolean;
}

export async function createLanguage(db: D1Database, input: CreateLanguageInput): Promise<LanguageRow> {
	const code = input.code.trim();
	const name = input.name.trim();
	if (!isValidLanguageCode(code)) {
		throw new Error("Invalid language code.");
	}
	if (!name) {
		throw new Error("Language name is required.");
	}

	await ensureLanguageTables(db);

	const enabled = input.enabled !== false ? 1 : 0;
	const wantsDefault = input.isDefault === true;

	const batch: D1PreparedStatement[] = [];
	if (wantsDefault) {
		batch.push(db.prepare(`UPDATE languages SET is_default = 0`));
	}
	batch.push(
		db.prepare(`INSERT INTO languages (code, name, enabled, is_default) VALUES (?1, ?2, ?3, ?4)`).bind(
			code,
			name,
			enabled,
			wantsDefault ? 1 : 0,
		),
	);
	await db.batch(batch);

	if (!wantsDefault) {
		const hasDefault = await db.prepare(`SELECT 1 FROM languages WHERE is_default = 1 LIMIT 1`).first();
		if (!hasDefault) {
			await db.prepare(`UPDATE languages SET is_default = 1 WHERE code = ?1`).bind(code).run();
		}
	}

	const created = await getLanguageByCode(db, code);
	if (!created) {
		throw new Error("Failed to load created language.");
	}
	return created;
}

export interface UpdateLanguageInput {
	name?: string;
	enabled?: boolean;
	isDefault?: boolean;
}

export async function updateLanguageByCode(
	db: D1Database,
	code: string,
	input: UpdateLanguageInput,
): Promise<LanguageRow | null> {
	const existing = await getLanguageByCode(db, code);
	if (!existing) {
		return null;
	}

	const nextName = input.name !== undefined ? input.name.trim() : existing.name;
	if (!nextName) {
		throw new Error("Language name is required.");
	}

	const nextEnabled = input.enabled !== undefined ? (input.enabled ? 1 : 0) : existing.enabled ? 1 : 0;
	let nextDefault = input.isDefault !== undefined ? (input.isDefault ? 1 : 0) : existing.isDefault ? 1 : 0;

	if (!nextEnabled && nextDefault) {
		nextDefault = 0;
	}

	const statements: D1PreparedStatement[] = [];
	if (input.isDefault === true) {
		statements.push(db.prepare(`UPDATE languages SET is_default = 0`));
		nextDefault = 1;
	}
	statements.push(
		db
			.prepare(`UPDATE languages SET name = ?1, enabled = ?2, is_default = ?3 WHERE code = ?4`)
			.bind(nextName, nextEnabled, nextDefault, code.trim()),
	);
	await db.batch(statements);

	const stillHasDefault = await db.prepare(`SELECT 1 FROM languages WHERE is_default = 1 LIMIT 1`).first();
	if (!stillHasDefault) {
		const pick = await db
			.prepare(`SELECT code FROM languages WHERE enabled = 1 ORDER BY name COLLATE NOCASE ASC LIMIT 1`)
			.first<{ code: string }>();
		if (pick?.code) {
			await db.prepare(`UPDATE languages SET is_default = 1 WHERE code = ?1`).bind(pick.code).run();
		}
	}

	return getLanguageByCode(db, code);
}
