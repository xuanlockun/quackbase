import {
	DEFAULT_LANGUAGE,
	type LocalizedText,
	normalizeLocalizedText,
	resolveLanguage,
	resolveLocalizedLabel,
	stringifyLocalizedText,
} from "./i18n";
import { loadLanguageCatalog, type LanguageCatalogState } from "./languages";

export type ContactFormFieldType = "text" | "email" | "textarea";

interface ContactFormFieldRecord {
	id: number;
	type: string;
	label: string;
	required: number;
	sort_order: number;
}

export interface ContactFormField {
	id: number;
	type: ContactFormFieldType;
	label: LocalizedText;
	required: boolean;
	order: number;
}

export interface ContactFormFieldInput {
	id?: number;
	type: ContactFormFieldType;
	label: LocalizedText;
	required: boolean;
	order: number;
}

export interface RenderableContactFormField extends ContactFormField {
	inputName: string;
	labelText: string;
}

export interface ContactFormSubmissionInput {
	language: string;
	sourcePath?: string;
	contactFormId?: number;
	values: Record<string, string>;
}

export interface ContactFormSubmissionRecord {
	id: number;
	contactFormId: number;
	language: string;
	sourcePath: string | null;
	values: Record<string, string>;
	submittedAt: Date;
}

const SUPPORTED_FIELD_TYPES = new Set<ContactFormFieldType>(["text", "email", "textarea"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function ensureFormTables(db: D1Database): Promise<void> {
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS form_fields (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT NOT NULL CHECK (type IN ('text', 'email', 'textarea')),
				label TEXT NOT NULL,
				required INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0, 1)),
				sort_order INTEGER NOT NULL DEFAULT 1,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_form_fields_sort_order
			ON form_fields (sort_order ASC, id ASC)`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS form_submissions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				contact_form_id INTEGER NOT NULL DEFAULT 0,
				language TEXT NOT NULL,
				source_path TEXT,
				values_json TEXT NOT NULL,
				submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at
			ON form_submissions (submitted_at DESC, id DESC)`,
		),
		db.prepare(
			`CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_form_id
			ON form_submissions (contact_form_id ASC, submitted_at DESC, id DESC)`,
		),
	]);

	const submissionColumns = await db.prepare(`PRAGMA table_info(form_submissions)`).all<{ name: string }>();
	const submissionColumnNames = new Set((submissionColumns.results ?? []).map((column) => column.name));
	if (!submissionColumnNames.has("contact_form_id")) {
		await db.prepare(`ALTER TABLE form_submissions ADD COLUMN contact_form_id INTEGER NOT NULL DEFAULT 0`).run();
	}
}

export async function listFormFields(db: D1Database): Promise<ContactFormField[]> {
	await ensureFormTables(db);
	const catalog = await loadLanguageCatalog(db);

	const result = await db
		.prepare(
			`SELECT id, type, label, required, sort_order
			FROM form_fields
			ORDER BY sort_order ASC, id ASC`,
		)
		.all<ContactFormFieldRecord>();

	return normalizeFormFields(result.results ?? [], catalog.defaultLanguageCode);
}

export async function saveFormFields(
	db: D1Database,
	fields: ContactFormFieldInput[],
): Promise<ContactFormField[]> {
	await ensureFormTables(db);
	const catalog = await loadLanguageCatalog(db);
	const normalizedFields = normalizeFormFields(fields, catalog.defaultLanguageCode);

	const statements: D1PreparedStatement[] = [db.prepare(`DELETE FROM form_fields`)];
	for (const field of normalizedFields) {
		statements.push(
			db
				.prepare(
					`INSERT INTO form_fields (type, label, required, sort_order, updated_at)
					VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)`,
				)
				.bind(field.type, stringifyLocalizedText(field.label, catalog), field.required ? 1 : 0, field.order),
		);
	}

	await db.batch(statements);
	return listFormFields(db);
}

export async function createFormSubmission(
	db: D1Database,
	input: ContactFormSubmissionInput,
): Promise<number> {
	await ensureFormTables(db);
	const catalog = await loadLanguageCatalog(db);

	const result = await db
		.prepare(
			`INSERT INTO form_submissions (contact_form_id, language, source_path, values_json, submitted_at)
			VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)`,
		)
		.bind(
			Number.isFinite(Number(input.contactFormId ?? 0)) && Number(input.contactFormId) > 0
				? Math.floor(Number(input.contactFormId))
				: 0,
			resolveLanguage(input.language, catalog),
			normalizeOptionalString(input.sourcePath),
			JSON.stringify(input.values),
		)
		.run();

	return Number(result.meta.last_row_id ?? 0);
}

export async function listFormSubmissions(
	db: D1Database,
	contactFormId?: number,
): Promise<ContactFormSubmissionRecord[]> {
	await ensureFormTables(db);
	const hasFilter = Number.isFinite(contactFormId ?? NaN) && Number(contactFormId) > 0;
	const query = hasFilter
		? `SELECT id, contact_form_id, language, source_path, values_json, submitted_at
			FROM form_submissions
			WHERE contact_form_id = ?1
			ORDER BY submitted_at DESC, id DESC`
		: `SELECT id, contact_form_id, language, source_path, values_json, submitted_at
			FROM form_submissions
			ORDER BY submitted_at DESC, id DESC`;
	const statement = hasFilter ? db.prepare(query).bind(Math.floor(Number(contactFormId))) : db.prepare(query);
	const result = await statement.all<{
		id: number;
		contact_form_id: number;
		language: string;
		source_path: string | null;
		values_json: string;
		submitted_at: string;
	}>();
	return (result.results ?? []).map((row) => ({
		id: row.id,
		contactFormId: row.contact_form_id,
		language: row.language,
		sourcePath: row.source_path,
		values: parseStoredSubmissionValues(row.values_json),
		submittedAt: new Date(row.submitted_at),
	}));
}

export async function countFormSubmissionsByContactFormId(db: D1Database): Promise<Map<number, number>> {
	await ensureFormTables(db);
	const result = await db
		.prepare(
			`SELECT contact_form_id, COUNT(*) AS count
			FROM form_submissions
			GROUP BY contact_form_id`,
		)
		.all<{ contact_form_id: number; count: number }>();
	return new Map((result.results ?? []).map((row) => [row.contact_form_id, row.count]));
}

export function parseFormFieldsForm(formData: FormData, key = "contactFormFields"): ContactFormField[] {
	return parseFormFieldsValue(formData.get(key), key);
}

export function parseFormFieldsPayload(payload: unknown, key = "fields"): ContactFormField[] {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid form field payload.");
	}

	return parseFormFieldsValue((payload as Record<string, unknown>)[key], key);
}

export function parseContactFormSubmissionForm(formData: FormData): ContactFormSubmissionInput {
	const values: Record<string, string> = {};
	for (const [key, rawValue] of formData.entries()) {
		if (!key.startsWith("field-") || typeof rawValue !== "string") {
			continue;
		}

		values[key.slice("field-".length)] = rawValue.trim();
	}

	return {
		language:
			typeof formData.get("language") === "string" ? String(formData.get("language")) : DEFAULT_LANGUAGE,
		sourcePath: typeof formData.get("sourcePath") === "string" ? String(formData.get("sourcePath")) : undefined,
		contactFormId: parsePositiveInteger(formData.get("contactFormId")),
		values,
	};
}

export function parseContactFormSubmissionPayload(payload: unknown): ContactFormSubmissionInput {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		throw new Error("Invalid contact form payload.");
	}

	const record = payload as Record<string, unknown>;
	const sourcePath = typeof record.sourcePath === "string" ? record.sourcePath.trim() : undefined;
	const valuesRecord =
		record.values && typeof record.values === "object" && !Array.isArray(record.values)
			? (record.values as Record<string, unknown>)
			: null;

	if (!valuesRecord) {
		throw new Error("Contact form values are required.");
	}

	const values: Record<string, string> = {};
	for (const [key, value] of Object.entries(valuesRecord)) {
		if (typeof value === "string") {
			values[key] = value.trim();
		}
	}

	return {
		language: typeof record.language === "string" ? record.language : DEFAULT_LANGUAGE,
		sourcePath,
		contactFormId: parsePositiveInteger(record.contactFormId),
		values,
	};
}

export function validateContactFormSubmission(
	fields: ContactFormField[],
	input: ContactFormSubmissionInput,
	catalog?: LanguageCatalogState,
): ContactFormSubmissionInput {
	const normalizedFields = normalizeFormFields(fields);
	if (normalizedFields.length === 0) {
		throw new Error("No contact form fields are configured.");
	}

	const values: Record<string, string> = {};
	for (const field of normalizedFields) {
		const key = String(field.id);
		const value = input.values[key]?.trim() ?? "";

		if (field.required && !value) {
			throw new Error(`Missing required field: ${key}`);
		}

		if (field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
			throw new Error(`Invalid email field: ${key}`);
		}

		values[key] = value;
	}

	return {
		language: resolveLanguage(input.language, catalog),
		sourcePath: normalizeOptionalString(input.sourcePath) ?? undefined,
		contactFormId: input.contactFormId,
		values,
	};
}

export function getRenderableFormFields(
	fields: ContactFormField[],
	language = DEFAULT_LANGUAGE,
	catalog?: LanguageCatalogState,
): RenderableContactFormField[] {
	return normalizeFormFields(fields).map((field) => ({
		...field,
		inputName: getContactFieldInputName(field.id),
		labelText: resolveLocalizedLabel(field.label, language, catalog),
	}));
}

export function getContactFieldInputName(fieldId: number): string {
	return `field-${fieldId}`;
}

export function normalizeFormFields(input: unknown, defaultLanguageCode?: string): ContactFormField[] {
	if (!Array.isArray(input)) {
		return [];
	}

	const normalized = input
		.map((item, index) => normalizeFormField(item, index, defaultLanguageCode))
		.filter((field): field is ContactFormField => Boolean(field))
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((field, index) => ({
			...field,
			order: index + 1,
		}));

	return normalized;
}

function parseFormFieldsValue(value: unknown, fieldName: string): ContactFormField[] {
	try {
		const parsed =
			typeof value === "string" ? JSON.parse(value || "[]") : Array.isArray(value) ? value : [];
		return normalizeFormFields(parsed);
	} catch {
		throw new Error(`Invalid localized field: ${fieldName}`);
	}
}

function normalizeFormField(item: unknown, index: number, defaultLanguageCode?: string): ContactFormField | null {
	if (!item || typeof item !== "object") {
		return null;
	}

	const record = item as Record<string, unknown>;
	const type = normalizeFieldType(record.type);
	if (!type) {
		return null;
	}

	const id = normalizePositiveInteger(record.id) ?? index + 1;
	const order = normalizePositiveInteger(record.order) ?? index + 1;

	return {
		id,
		type,
		label: normalizeLocalizedText(record.label, {
			requireDefault: true,
			defaultLanguageCode: defaultLanguageCode ?? DEFAULT_LANGUAGE,
		}),
		required: normalizeBoolean(record.required),
		order,
	};
}

function normalizeFieldType(value: unknown): ContactFormFieldType | null {
	if (typeof value !== "string") {
		return null;
	}

	return SUPPORTED_FIELD_TYPES.has(value as ContactFormFieldType) ? (value as ContactFormFieldType) : null;
}

function normalizePositiveInteger(value: unknown): number | null {
	const numericValue =
		typeof value === "number"
			? value
			: typeof value === "string" && value.trim() !== ""
				? Number.parseInt(value, 10)
				: Number.NaN;

	if (!Number.isFinite(numericValue) || numericValue <= 0) {
		return null;
	}

	return Math.max(1, Math.floor(numericValue));
}

function normalizeBoolean(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "number") {
		return value === 1;
	}

	if (typeof value === "string") {
		return ["1", "true", "on", "yes"].includes(value.trim().toLowerCase());
	}

	return false;
}

function parsePositiveInteger(value: FormDataEntryValue | unknown): number | undefined {
	if (typeof value === "number") {
		return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
	}

	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number.parseInt(value, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
	}

	return undefined;
}

function normalizeOptionalString(value?: string | null): string | null {
	return value && value.trim() ? value.trim() : null;
}

function parseStoredSubmissionValues(value: string): Record<string, string> {
	try {
		const parsed = JSON.parse(value || "{}");
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {};
		}

	const entries = Object.entries(parsed as Record<string, unknown>).filter(
		([, entry]): entry is [string, string] => typeof entry === "string",
	);
	return Object.fromEntries(entries);
	} catch {
		return {};
	}
}
