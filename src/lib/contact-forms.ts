import { getLanguageCatalog, type LocalizedText, normalizeLocalizedText, stringifyLocalizedText } from "./i18n";
import { type ContactFormField, type ContactFormFieldInput, normalizeFormFields, parseFormFieldsForm, parseFormFieldsPayload } from "./forms";

export interface ContactFormRecord {
	id: number;
	title: string;
	fields: ContactFormField[];
	isActive: boolean;
	sortOrder: number;
	updatedAt: Date;
}

export interface ContactFormInput {
	title: string;
	fields: ContactFormFieldInput[];
	isActive: boolean;
	sortOrder: number;
}

interface ContactFormRow {
	id: number;
	title: string;
	fields_json: string;
	is_active: number;
	sort_order: number;
	updated_at: string;
}

export async function ensureContactFormTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS contact_forms (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				fields_json TEXT NOT NULL DEFAULT '[]',
				is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
				sort_order INTEGER NOT NULL DEFAULT 0,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_contact_forms_sort_order
			ON contact_forms (sort_order ASC, id ASC)`,
		),
	]);
}

export async function listContactForms(db: D1Database, activeOnly = false): Promise<ContactFormRecord[]> {
	await ensureContactFormTables(db);
	const query = activeOnly
		? `SELECT id, title, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		: `SELECT id, title, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			ORDER BY sort_order ASC, id ASC`;
	const result = await db.prepare(query).all<ContactFormRow>();
	return (result.results ?? []).map(toContactFormRecord);
}

export async function getContactFormById(db: D1Database, id: number): Promise<ContactFormRecord | null> {
	await ensureContactFormTables(db);
	const row = await db
		.prepare(
			`SELECT id, title, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			WHERE id = ?1`,
		)
		.bind(id)
		.first<ContactFormRow>();
	return row ? toContactFormRecord(row) : null;
}

export async function createContactForm(db: D1Database, input: ContactFormInput): Promise<number> {
	await ensureContactFormTables(db);
	const catalog = getLanguageCatalogForForms();
	const normalizedFields = normalizeFormFields(input.fields, catalog.defaultLanguageCode);
	const result = await db
		.prepare(
			`INSERT INTO contact_forms (title, fields_json, is_active, sort_order, updated_at)
			VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)`,
		)
		.bind(
			input.title.trim(),
			JSON.stringify(normalizedFields),
			input.isActive ? 1 : 0,
			normalizeSortOrder(input.sortOrder),
		)
		.run();
	return Number(result.meta.last_row_id ?? 0);
}

export async function updateContactForm(db: D1Database, id: number, input: ContactFormInput): Promise<void> {
	await ensureContactFormTables(db);
	const catalog = getLanguageCatalogForForms();
	const normalizedFields = normalizeFormFields(input.fields, catalog.defaultLanguageCode);
	await db
		.prepare(
			`UPDATE contact_forms
			SET title = ?1,
				fields_json = ?2,
				is_active = ?3,
				sort_order = ?4,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?5`,
		)
		.bind(
			input.title.trim(),
			JSON.stringify(normalizedFields),
			input.isActive ? 1 : 0,
			normalizeSortOrder(input.sortOrder),
			id,
		)
		.run();
}

export async function deleteContactForm(db: D1Database, id: number): Promise<void> {
	await ensureContactFormTables(db);
	await db.prepare("DELETE FROM contact_forms WHERE id = ?1").bind(id).run();
}

export function parseContactFormForm(formData: FormData): ContactFormInput {
	return {
		title: requiredString(formData, "title"),
		fields: parseFormFieldsForm(formData),
		isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
		sortOrder: Number.parseInt(optionalString(formData, "sortOrder") || "0", 10) || 0,
	};
}

export function parseContactFormPayload(payload: unknown): ContactFormInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid contact form payload.");
	}

	const record = payload as Record<string, unknown>;
	const fields = parseFormFieldsPayload(payload, "fields");
	return {
		title: typeof record.title === "string" ? record.title.trim() : "",
		fields,
		isActive: Boolean(record.isActive),
		sortOrder: normalizeSortOrder(
			typeof record.sortOrder === "number" ? record.sortOrder : Number.parseInt(String(record.sortOrder ?? "0"), 10),
		),
	};
}

export function getContactFormFields(record: ContactFormRecord | null | undefined): ContactFormField[] {
	return record?.fields ?? [];
}

function toContactFormRecord(row: ContactFormRow): ContactFormRecord {
	return {
		id: row.id,
		title: row.title,
		fields: normalizeFormFields(row.fields_json),
		isActive: row.is_active === 1,
		sortOrder: row.sort_order,
		updatedAt: new Date(row.updated_at),
	};
}

function requiredString(formData: FormData, key: string): string {
	const value = formData.get(key);
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`${key} is required.`);
	}
	return value.trim();
}

function optionalString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function normalizeSortOrder(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function getLanguageCatalogForForms() {
	return getLanguageCatalog(undefined);
}
