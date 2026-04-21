import {
	DEFAULT_LANGUAGE,
	type LocalizedText,
	getLanguageCatalog,
	normalizeLocalizedText,
	resolveLanguage,
	resolveLocalizedValue,
	stringifyLocalizedText,
} from "./i18n";
import {
	type ContactFormField,
	type ContactFormFieldInput,
	normalizeFormFields,
	parseFormFieldsForm,
	parseFormFieldsPayload,
} from "./forms";

export type ContactFormLayout = "split" | "stacked" | "compact";
export type ContactFormBackgroundStyle = "solid" | "gradient" | "radial";

export interface ContactFormRecord {
	id: number;
	title: string;
	titleTranslations: LocalizedText;
	description: string;
	descriptionTranslations: LocalizedText;
	showTitle: boolean;
	showDescription: boolean;
	formTitle: string;
	formTitleTranslations: LocalizedText;
	formDescription: string;
	formDescriptionTranslations: LocalizedText;
	showFormTitle: boolean;
	showFormDescription: boolean;
	layout: ContactFormLayout;
	backgroundStyle: ContactFormBackgroundStyle;
	backgroundColor: string;
	buttonColor: string;
	useCaptcha: boolean;
	fields: ContactFormField[];
	isActive: boolean;
	sortOrder: number;
	updatedAt: Date;
	requestedLanguage: string;
	resolvedLanguage: string;
}

export interface ContactFormInput {
	titleTranslations: LocalizedText;
	descriptionTranslations: LocalizedText;
	showTitle: boolean;
	showDescription: boolean;
	formTitleTranslations: LocalizedText;
	formDescriptionTranslations: LocalizedText;
	showFormTitle: boolean;
	showFormDescription: boolean;
	layout: ContactFormLayout;
	backgroundStyle: ContactFormBackgroundStyle;
	backgroundColor: string;
	buttonColor: string;
	useCaptcha: boolean;
	fields: ContactFormFieldInput[];
	isActive: boolean;
	sortOrder: number;
}

interface ContactFormRow {
	id: number;
	title: string;
	description: string;
	show_title: number;
	show_description: number;
	form_title: string;
	form_description: string;
	show_form_title: number;
	show_form_description: number;
	layout: string;
	background_style: string;
	background_color: string;
	button_color: string;
	use_captcha: number;
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
				description TEXT NOT NULL DEFAULT '',
				show_title INTEGER NOT NULL DEFAULT 1 CHECK (show_title IN (0, 1)),
				show_description INTEGER NOT NULL DEFAULT 1 CHECK (show_description IN (0, 1)),
				form_title TEXT NOT NULL DEFAULT '',
				form_description TEXT NOT NULL DEFAULT '',
				show_form_title INTEGER NOT NULL DEFAULT 1 CHECK (show_form_title IN (0, 1)),
				show_form_description INTEGER NOT NULL DEFAULT 1 CHECK (show_form_description IN (0, 1)),
				layout TEXT NOT NULL DEFAULT 'split',
				background_style TEXT NOT NULL DEFAULT 'solid',
				background_color TEXT NOT NULL DEFAULT '#f8fbff',
				button_color TEXT NOT NULL DEFAULT '#4f80ff',
				use_captcha INTEGER NOT NULL DEFAULT 0 CHECK (use_captcha IN (0, 1)),
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

	const tableInfo = await db.prepare(`PRAGMA table_info(contact_forms)`).all<{ name: string }>();
	const columnNames = new Set((tableInfo.results ?? []).map((column) => column.name));
	if (!columnNames.has("description")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN description TEXT NOT NULL DEFAULT ''`).run();
	}
	if (!columnNames.has("show_title")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN show_title INTEGER NOT NULL DEFAULT 1 CHECK (show_title IN (0, 1))`).run();
	}
	if (!columnNames.has("show_description")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN show_description INTEGER NOT NULL DEFAULT 1 CHECK (show_description IN (0, 1))`).run();
	}
	if (!columnNames.has("form_title")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN form_title TEXT NOT NULL DEFAULT ''`).run();
	}
	if (!columnNames.has("form_description")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN form_description TEXT NOT NULL DEFAULT ''`).run();
	}
	if (!columnNames.has("show_form_title")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN show_form_title INTEGER NOT NULL DEFAULT 1 CHECK (show_form_title IN (0, 1))`).run();
	}
	if (!columnNames.has("show_form_description")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN show_form_description INTEGER NOT NULL DEFAULT 1 CHECK (show_form_description IN (0, 1))`).run();
	}
	if (!columnNames.has("layout")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN layout TEXT NOT NULL DEFAULT 'split'`).run();
	}
	if (!columnNames.has("background_style")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN background_style TEXT NOT NULL DEFAULT 'solid'`).run();
	}
	if (!columnNames.has("background_color")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN background_color TEXT NOT NULL DEFAULT '#f8fbff'`).run();
	}
	if (!columnNames.has("button_color")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN button_color TEXT NOT NULL DEFAULT '#4f80ff'`).run();
	}
	if (!columnNames.has("use_captcha")) {
		await db.prepare(`ALTER TABLE contact_forms ADD COLUMN use_captcha INTEGER NOT NULL DEFAULT 0 CHECK (use_captcha IN (0, 1))`).run();
	}

	await db
		.prepare(
			`UPDATE contact_forms
			SET title = CASE WHEN json_valid(title) THEN title ELSE json_object('en', title) END,
				description = CASE
					WHEN json_valid(description) THEN description
					WHEN trim(description) = '' THEN ''
					ELSE json_object('en', description)
				END,
				form_title = CASE
					WHEN json_valid(form_title) THEN form_title
					WHEN trim(form_title) = '' THEN ''
					ELSE json_object('en', form_title)
				END,
				form_description = CASE
					WHEN json_valid(form_description) THEN form_description
					WHEN trim(form_description) = '' THEN ''
					ELSE json_object('en', form_description)
				END`,
		)
		.run();
}

export async function listContactForms(
	db: D1Database,
	activeOnly = false,
	language = DEFAULT_LANGUAGE,
	catalog?: ReturnType<typeof getLanguageCatalog>,
): Promise<ContactFormRecord[]> {
	await ensureContactFormTables(db);
	const c = catalog ?? getLanguageCatalogForForms();
	const query = activeOnly
		? `SELECT id, title, description, show_title, show_description, form_title, form_description, show_form_title, show_form_description, layout, background_style, background_color, button_color, use_captcha, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			WHERE is_active = 1
			ORDER BY sort_order ASC, id ASC`
		: `SELECT id, title, description, show_title, show_description, form_title, form_description, show_form_title, show_form_description, layout, background_style, background_color, button_color, use_captcha, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			ORDER BY sort_order ASC, id ASC`;
	const result = await db.prepare(query).all<ContactFormRow>();
	return (result.results ?? []).map((row) => toContactFormRecord(row, language, c));
}

export async function getContactFormById(
	db: D1Database,
	id: number,
	language = DEFAULT_LANGUAGE,
	catalog?: ReturnType<typeof getLanguageCatalog>,
): Promise<ContactFormRecord | null> {
	await ensureContactFormTables(db);
	const c = catalog ?? getLanguageCatalogForForms();
	const row = await db
		.prepare(
			`SELECT id, title, description, show_title, show_description, form_title, form_description, show_form_title, show_form_description, layout, background_style, background_color, button_color, use_captcha, fields_json, is_active, sort_order, updated_at
			FROM contact_forms
			WHERE id = ?1`,
		)
		.bind(id)
		.first<ContactFormRow>();
	return row ? toContactFormRecord(row, language, c) : null;
}

export async function createContactForm(db: D1Database, input: ContactFormInput): Promise<number> {
	await ensureContactFormTables(db);
	const catalog = getLanguageCatalogForForms();
	const normalizedFields = normalizeFormFields(input.fields, catalog.defaultLanguageCode);
	const result = await db
		.prepare(
			`INSERT INTO contact_forms (title, description, show_title, show_description, form_title, form_description, show_form_title, show_form_description, layout, background_style, background_color, button_color, use_captcha, fields_json, is_active, sort_order, updated_at)
			VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, CURRENT_TIMESTAMP)`,
		)
		.bind(
			serializeLocalizedText(input.titleTranslations, catalog, true),
			serializeLocalizedText(input.descriptionTranslations, catalog, false),
			input.showTitle ? 1 : 0,
			input.showDescription ? 1 : 0,
			serializeLocalizedText(input.formTitleTranslations, catalog, false),
			serializeLocalizedText(input.formDescriptionTranslations, catalog, false),
			input.showFormTitle ? 1 : 0,
			input.showFormDescription ? 1 : 0,
			normalizeContactFormLayout(input.layout),
			normalizeContactFormBackgroundStyle(input.backgroundStyle),
			normalizeContactFormColor(input.backgroundColor, "#f8fbff"),
			normalizeContactFormColor(input.buttonColor, "#4f80ff"),
			input.useCaptcha ? 1 : 0,
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
				description = ?2,
				show_title = ?3,
				show_description = ?4,
				form_title = ?5,
				form_description = ?6,
				show_form_title = ?7,
				show_form_description = ?8,
				layout = ?9,
				background_style = ?10,
				background_color = ?11,
				button_color = ?12,
				use_captcha = ?13,
				fields_json = ?14,
				is_active = ?15,
				sort_order = ?16,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?17`,
		)
		.bind(
			serializeLocalizedText(input.titleTranslations, catalog, true),
			serializeLocalizedText(input.descriptionTranslations, catalog, false),
			input.showTitle ? 1 : 0,
			input.showDescription ? 1 : 0,
			serializeLocalizedText(input.formTitleTranslations, catalog, false),
			serializeLocalizedText(input.formDescriptionTranslations, catalog, false),
			input.showFormTitle ? 1 : 0,
			input.showFormDescription ? 1 : 0,
			normalizeContactFormLayout(input.layout),
			normalizeContactFormBackgroundStyle(input.backgroundStyle),
			normalizeContactFormColor(input.backgroundColor, "#f8fbff"),
			normalizeContactFormColor(input.buttonColor, "#4f80ff"),
			input.useCaptcha ? 1 : 0,
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
	const catalog = getLanguageCatalogForForms();
	return {
		titleTranslations: parseLocalizedFieldValue(formData.get("title"), "title", catalog.defaultLanguageCode, true),
		descriptionTranslations: parseLocalizedFieldValue(formData.get("description"), "description", catalog.defaultLanguageCode, false),
		showTitle: optionalBoolean(formData, "showTitle"),
		showDescription: optionalBoolean(formData, "showDescription"),
		formTitleTranslations: parseLocalizedFieldValue(formData.get("formTitle"), "formTitle", catalog.defaultLanguageCode, false),
		formDescriptionTranslations: parseLocalizedFieldValue(formData.get("formDescription"), "formDescription", catalog.defaultLanguageCode, false),
		showFormTitle: optionalBoolean(formData, "showFormTitle"),
		showFormDescription: optionalBoolean(formData, "showFormDescription"),
		layout: normalizeContactFormLayout(optionalString(formData, "layout")),
		backgroundStyle: normalizeContactFormBackgroundStyle(optionalString(formData, "backgroundStyle")),
		backgroundColor: normalizeContactFormColor(optionalString(formData, "backgroundColor"), "#f8fbff"),
		buttonColor: normalizeContactFormColor(optionalString(formData, "buttonColor"), "#4f80ff"),
		useCaptcha: optionalBoolean(formData, "useCaptcha"),
		fields: parseFormFieldsForm(formData),
		isActive: optionalBoolean(formData, "isActive"),
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
		titleTranslations: parseLocalizedFieldValue(record.title, "title", DEFAULT_LANGUAGE, true),
		descriptionTranslations: parseLocalizedFieldValue(record.description, "description", DEFAULT_LANGUAGE, false),
		showTitle: parseBoolean(record.showTitle),
		showDescription: parseBoolean(record.showDescription),
		formTitleTranslations: parseLocalizedFieldValue(record.formTitle, "formTitle", DEFAULT_LANGUAGE, false),
		formDescriptionTranslations: parseLocalizedFieldValue(record.formDescription, "formDescription", DEFAULT_LANGUAGE, false),
		showFormTitle: parseBoolean(record.showFormTitle),
		showFormDescription: parseBoolean(record.showFormDescription),
		layout: normalizeContactFormLayout(typeof record.layout === "string" ? record.layout : ""),
		backgroundStyle: normalizeContactFormBackgroundStyle(
			typeof record.backgroundStyle === "string" ? record.backgroundStyle : "",
		),
		backgroundColor: normalizeContactFormColor(
			typeof record.backgroundColor === "string" ? record.backgroundColor : "",
			"#f8fbff",
		),
		buttonColor: normalizeContactFormColor(
			typeof record.buttonColor === "string" ? record.buttonColor : "",
			"#4f80ff",
		),
		useCaptcha: parseBoolean(record.useCaptcha),
		fields,
		isActive: parseBoolean(record.isActive),
		sortOrder: normalizeSortOrder(
			typeof record.sortOrder === "number" ? record.sortOrder : Number.parseInt(String(record.sortOrder ?? "0"), 10),
		),
	};
}

export function getContactFormFields(record: ContactFormRecord | null | undefined): ContactFormField[] {
	return record?.fields ?? [];
}

function toContactFormRecord(row: ContactFormRow, requestedLanguage: string, catalog: ReturnType<typeof getLanguageCatalog>): ContactFormRecord {
	const titleTranslations = normalizeLocalizedText(row.title, {
		fallbackValue: row.title,
		requireDefault: true,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const descriptionTranslations = normalizeLocalizedText(row.description, {
		fallbackValue: row.description,
		requireDefault: false,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const formTitleTranslations = normalizeLocalizedText(row.form_title, {
		fallbackValue: row.form_title,
		requireDefault: false,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const formDescriptionTranslations = normalizeLocalizedText(row.form_description, {
		fallbackValue: row.form_description,
		requireDefault: false,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	const language = resolveLanguage(requestedLanguage, catalog);
	const title = resolveLocalizedValue(titleTranslations, language, catalog);
	const description = resolveLocalizedValue(descriptionTranslations, language, catalog);
	const formTitle = resolveLocalizedValue(formTitleTranslations, language, catalog) || title;
	const formDescription = resolveLocalizedValue(formDescriptionTranslations, language, catalog) || description;
	return {
		id: row.id,
		title,
		titleTranslations,
		description,
		descriptionTranslations,
		showTitle: row.show_title === 1,
		showDescription: row.show_description === 1,
		formTitle,
		formTitleTranslations,
		formDescription,
		formDescriptionTranslations,
		showFormTitle: row.show_form_title === 1,
		showFormDescription: row.show_form_description === 1,
		layout: normalizeContactFormLayout(row.layout),
		backgroundStyle: normalizeContactFormBackgroundStyle(row.background_style),
		backgroundColor: normalizeContactFormColor(row.background_color, "#f8fbff"),
		buttonColor: normalizeContactFormColor(row.button_color, "#4f80ff"),
		useCaptcha: row.use_captcha === 1,
		fields: parseStoredFieldsJson(row.fields_json),
		isActive: row.is_active === 1,
		sortOrder: row.sort_order,
		updatedAt: new Date(row.updated_at),
		requestedLanguage: language,
		resolvedLanguage:
			(titleTranslations[language]?.trim() ||
				descriptionTranslations[language]?.trim() ||
				formTitleTranslations[language]?.trim() ||
				formDescriptionTranslations[language]?.trim())
				? language
				: catalog.defaultLanguageCode,
	};
}

function parseStoredFieldsJson(value: string): ContactFormField[] {
	try {
		const parsed = JSON.parse(value || "[]");
		return normalizeFormFields(parsed);
	} catch {
		return [];
	}
}

function optionalString(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
}

function normalizeSortOrder(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function parseBoolean(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		return value === 1;
	}
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "1" || normalized === "true" || normalized === "on" || normalized === "yes";
	}
	return false;
}

function optionalBoolean(formData: FormData, key: string): boolean {
	return parseBoolean(formData.get(key));
}

function parseLocalizedFieldValue(
	value: unknown,
	fieldName: string,
	defaultLanguageCode: string,
	requireDefault: boolean,
): LocalizedText {
	try {
		return normalizeLocalizedText(value, {
			requireDefault,
			defaultLanguageCode,
		});
	} catch {
		throw new Error(`Invalid localized field: ${fieldName}`);
	}
}

function serializeLocalizedText(translations: LocalizedText, catalog: ReturnType<typeof getLanguageCatalog>, requireDefault: boolean): string {
	const normalized = normalizeLocalizedText(translations, {
		requireDefault,
		defaultLanguageCode: catalog.defaultLanguageCode,
	});
	if (Object.keys(normalized).length === 0) {
		return "";
	}

	if (!normalized[catalog.defaultLanguageCode]) {
		const fallback = Object.values(normalized).find((value) => typeof value === "string" && value.trim());
		if (typeof fallback === "string" && fallback.trim()) {
			normalized[catalog.defaultLanguageCode] = fallback.trim();
		}
	}

	return stringifyLocalizedText(normalized, catalog);
}

function normalizeContactFormLayout(value: string): ContactFormLayout {
	return value === "stacked" || value === "compact" ? value : "split";
}

function normalizeContactFormBackgroundStyle(value: string): ContactFormBackgroundStyle {
	return value === "gradient" || value === "radial" ? value : "solid";
}

function normalizeContactFormColor(value: string, fallback: string): string {
	const trimmed = typeof value === "string" ? value.trim() : "";
	return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed) ? trimmed : fallback;
}

function getLanguageCatalogForForms() {
	return getLanguageCatalog(undefined);
}
