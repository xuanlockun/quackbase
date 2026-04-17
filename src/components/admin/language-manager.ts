const table = document.querySelector<HTMLTableElement>("[data-language-table]");
const form = document.querySelector<HTMLFormElement>("[data-language-form]");
const notice = document.querySelector<HTMLElement>("[data-language-notice]");

if (!table || !form || !notice) {
	throw new Error("Language manager could not find required elements.");
}

const tbody = table.querySelector("tbody");
const apiBase = table.dataset.apiBase ?? "/api/admin/languages";
const formAction = form.action || apiBase;
const dataset = table.dataset;
const columnCount = table.querySelectorAll("thead th").length || 5;
const emptyMessage = dataset.textEmpty ?? "No languages are configured yet.";
const loadingMessage = dataset.textLoading ?? "Loading languages...";

const messages = {
	createSuccess: dataset.messageCreateSuccess ?? "Language created.",
	updateSuccess: dataset.messageUpdateSuccess ?? "Language updated.",
	error: dataset.messageError ?? "Unable to update languages.",
};

const texts = {
	active: dataset.textActive ?? "Active",
	inactive: dataset.textInactive ?? "Inactive",
	defaultLabel: dataset.textDefault ?? "Default",
	setDefault: dataset.textSetDefault ?? "Set as default",
};

const toggleIconHtml = `
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
		<rect x="3.5" y="5" width="17" height="14" rx="0" />
		<path d="M8 9h8" />
		<path d="M8 13h5" />
	</svg>
`;

let cachedLanguages: LanguageRecord[] = [];

function showNotice(text: string, variant: "success" | "danger" = "success") {
	notice.innerHTML = "";
	const alert = document.createElement("div");
	alert.className = `alert alert-${variant} mb-0`;
	alert.setAttribute("role", "alert");
	alert.textContent = text;
	notice.appendChild(alert);
}

function buildRow(language: LanguageRecord): HTMLTableRowElement {
	const tr = document.createElement("tr");
	tr.dataset.languageRow = "true";
	tr.dataset.languageCode = language.code;

	const codeCell = document.createElement("td");
	codeCell.innerHTML = `<code>${language.code}</code>`;

	const nameCell = document.createElement("td");
	nameCell.textContent = language.name;

	const enabledCell = document.createElement("td");
	const enabledButton = document.createElement("button");
	enabledButton.type = "button";
	enabledButton.className = "btn btn-sm btn-outline-primary";
	enabledButton.dataset.action = "toggle-enabled";
	enabledButton.dataset.code = language.code;
	enabledButton.dataset.enabled = String(language.enabled);
	enabledButton.setAttribute("aria-label", language.enabled ? "Disable language" : "Enable language");
	enabledButton.title = language.enabled ? "Disable language" : "Enable language";
	enabledButton.innerHTML = `<span class="admin-icon-action-icon" aria-hidden="true">${toggleIconHtml}</span><span class="visually-hidden">${
		language.enabled ? "Disable language" : "Enable language"
	}</span>`;
	enabledCell.appendChild(enabledButton);

	const defaultCell = document.createElement("td");
	const defaultButton = document.createElement("button");
	defaultButton.type = "button";
	defaultButton.className = ["btn", "btn-sm", "btn-outline-secondary", language.isDefault ? "active" : ""]
		.filter(Boolean)
		.join(" ");
	defaultButton.setAttribute("aria-pressed", language.isDefault ? "true" : "false");
	defaultButton.dataset.action = "set-default";
	defaultButton.dataset.code = language.code;
	defaultButton.dataset.default = String(language.isDefault);
	defaultButton.textContent = language.isDefault ? texts.defaultLabel : texts.setDefault;
	defaultCell.appendChild(defaultButton);

	const statusCell = document.createElement("td");
	const statusBadge = document.createElement("span");
	statusBadge.className = [
		"badge",
		language.isDefault ? "bg-primary" : language.enabled ? "bg-success" : "bg-secondary",
	].join(" ");
	statusBadge.dataset.languageStatus = "true";
	statusBadge.textContent = language.isDefault
		? texts.defaultLabel
		: language.enabled
			? texts.active
			: texts.inactive;
	statusCell.appendChild(statusBadge);

	tr.appendChild(codeCell);
	tr.appendChild(nameCell);
	tr.appendChild(enabledCell);
	tr.appendChild(defaultCell);
	tr.appendChild(statusCell);

	return tr;
}

async function refreshLanguages(): Promise<LanguageRecord[]> {
	setLoadingState(true);
	try {
		const response = await fetch(apiBase);
		if (!response.ok) {
			throw new Error(messages.error);
		}
		const result = await response.json().catch(() => null);
		if (!result?.languages || !Array.isArray(result.languages)) {
			throw new Error(messages.error);
		}
		renderRows(result.languages);
		return result.languages;
	} catch (error) {
		if (!cachedLanguages.length) {
			showMessageRow(emptyMessage);
		}
		throw error;
	} finally {
		setLoadingState(false);
	}
}

function renderRows(languages: LanguageRecord[]) {
	if (!tbody) {
		return;
	}
	cachedLanguages = languages;
	if (languages.length === 0) {
		showMessageRow(emptyMessage);
		return;
	}
	tbody.innerHTML = "";
	for (const language of languages) {
		tbody.appendChild(buildRow(language));
	}
}

async function patchLanguage(code: string, payload: Record<string, unknown>, successMessage: string) {
	const response = await fetch(`${apiBase}/${encodeURIComponent(code)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(body?.error ?? messages.error);
	}
	await refreshLanguages();
	showNotice(successMessage, "success");
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = new FormData(form);
	const payload = {
		code: (data.get("code") as string)?.trim(),
		name: (data.get("name") as string)?.trim(),
		enabled: data.get("enabled") !== null,
		isDefault: data.get("isDefault") !== null,
	};
	try {
	const response = await fetch(formAction, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			throw new Error(body?.error ?? messages.error);
		}
		await refreshLanguages();
		form.reset();
		showNotice(messages.createSuccess, "success");
	} catch (error) {
		showNotice(error instanceof Error ? error.message : messages.error, "danger");
	}
});

table.addEventListener("click", (event) => {
	const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
	if (!target) {
		return;
	}
	const action = target.dataset.action;
	const code = target.dataset.code;
	if (!action || !code) {
		return;
	}

	if (action === "toggle-enabled") {
		const enabled = target.dataset.enabled === "true";
		patchLanguage(code, { enabled: !enabled }, messages.updateSuccess).catch((error) =>
			showNotice(error instanceof Error ? error.message : messages.error, "danger"),
		);
		return;
	}

	if (action === "set-default") {
		patchLanguage(code, { isDefault: true }, messages.updateSuccess).catch((error) =>
			showNotice(error instanceof Error ? error.message : messages.error, "danger"),
		);
	}
});

function showMessageRow(text: string) {
	if (!tbody) {
		return;
	}
	const row = document.createElement("tr");
	const cell = document.createElement("td");
	cell.colSpan = columnCount;
	cell.className = "text-center text-muted py-4 small";
	cell.textContent = text;
	row.appendChild(cell);
	tbody.innerHTML = "";
	tbody.appendChild(row);
}

function setLoadingState(isLoading: boolean) {
	table.dataset.loading = isLoading ? "true" : "false";
	if (isLoading && cachedLanguages.length === 0) {
		showMessageRow(loadingMessage);
	}
}

refreshLanguages().catch((error) => showNotice(error instanceof Error ? error.message : messages.error, "danger"));

type LanguageRecord = {
	code: string;
	name: string;
	enabled: boolean;
	isDefault: boolean;
};
