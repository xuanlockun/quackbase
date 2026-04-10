type TranslationEntryPayload = {
	key: string;
	value: string;
};

type TranslationEntryRecord = {
	translationKey: string;
	translatedValue: string;
	updatedAt: string;
};

const table = document.querySelector<HTMLTableElement>("[data-translation-table]");
const form = document.querySelector<HTMLFormElement>("[data-translation-form]");
const notice = document.querySelector<HTMLElement>("[data-translation-notice]");

if (!table || !form || !notice) {
	throw new Error("Translation manager could not find required elements.");
}

const dataset = table.dataset;
const locale = dataset.locale ?? "";
if (!locale) {
	throw new Error("Locale context is missing.");
}

const apiBase = dataset.apiBase ?? `/api/admin/languages/${locale}/translations`;
const columnCount = table.querySelectorAll("thead th").length || 4;
let cachedEntries: TranslationEntryRecord[] = [];

const messages = {
	createSuccess: dataset.messageCreateSuccess ?? "Translation added.",
	updateSuccess: dataset.messageUpdateSuccess ?? "Translation updated.",
	deleteSuccess: dataset.messageDeleteSuccess ?? "Translation deleted.",
	error: dataset.messageError ?? "Unable to process the request.",
};

const texts = {
	empty: dataset.textEmpty ?? "No translations yet for this locale.",
	loading: dataset.textLoading ?? "Loading translations...",
};

const tbody = table.querySelector("tbody");
if (!tbody) {
	throw new Error("Translation table body is missing.");
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const data = new FormData(form);
	const payload: TranslationEntryPayload = {
		key: (data.get("key") as string)?.trim() ?? "",
		value: (data.get("value") as string)?.trim() ?? "",
	};
	try {
		await createEntry(payload);
		form.reset();
		showNotice(messages.createSuccess, "success");
		await refreshEntries();
	} catch (error) {
		showNotice(error instanceof Error ? error.message : messages.error, "danger");
	}
});

table.addEventListener("click", (event) => {
	const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
	if (!target) {
		return;
	}

	const action = target.dataset.action;
	const key = target.dataset.key;
	const entry = cachedEntries.find((record) => record.translationKey === key);
	if (!action || !key) {
		return;
	}

	if (action === "edit" && entry) {
		const nextValue = window.prompt("Enter the new translation value", entry.translatedValue);
		if (nextValue === null) {
			return;
		}
		updateEntry(key, nextValue.trim())
			.then(() => {
				showNotice(messages.updateSuccess, "success");
				refreshEntries().catch((error) => showNotice(handleError(error), "danger"));
			})
			.catch((error) => showNotice(handleError(error), "danger"));
		return;
	}

	if (action === "delete") {
		const confirmed = window.confirm("Delete this translation entry?");
		if (!confirmed) {
			return;
		}
		deleteEntry(key)
			.then(() => {
				showNotice(messages.deleteSuccess, "success");
				refreshEntries().catch((error) => showNotice(handleError(error), "danger"));
			})
			.catch((error) => showNotice(handleError(error), "danger"));
	}
});

refreshEntries().catch((error) => showNotice(handleError(error), "danger"));

async function refreshEntries(): Promise<void> {
	setLoadingState(true);
	try {
		const response = await fetch(apiBase);
		if (!response.ok) {
			throw new Error(messages.error);
		}
		const body = (await response.json().catch(() => ({} as Record<string, unknown>))) ?? {};
		if (!Array.isArray(body.entries)) {
			throw new Error(messages.error);
		}
		cachedEntries = body.entries.map((entry: Record<string, unknown>) => ({
			translationKey: String(entry.translationKey ?? entry.translation_key ?? ""),
			translatedValue: String(entry.translatedValue ?? entry.translated_value ?? ""),
			updatedAt: String(entry.updatedAt ?? entry.updated_at ?? ""),
		}));
		renderRows(cachedEntries);
	} catch (error) {
		if (!cachedEntries.length) {
			showMessageRow(texts.empty);
		}
		throw error;
	} finally {
		setLoadingState(false);
	}
}

function renderRows(entries: TranslationEntryRecord[]) {
	if (!tbody) {
		return;
	}
	if (entries.length === 0) {
		showMessageRow(texts.empty);
		return;
	}
	tbody.innerHTML = "";
	for (const entry of entries) {
		tbody.appendChild(buildRow(entry));
	}
}

function buildRow(entry: TranslationEntryRecord): HTMLTableRowElement {
	const row = document.createElement("tr");

	const keyCell = document.createElement("td");
	keyCell.innerHTML = `<code>${entry.translationKey}</code>`;

	const valueCell = document.createElement("td");
	valueCell.textContent = entry.translatedValue;

	const updatedCell = document.createElement("td");
	updatedCell.textContent = entry.updatedAt;

	const actionsCell = document.createElement("td");
	actionsCell.className = "d-flex flex-wrap gap-2";

	const editButton = document.createElement("button");
	editButton.type = "button";
	editButton.className = "btn btn-outline-primary btn-sm";
	editButton.dataset.action = "edit";
	editButton.dataset.key = entry.translationKey;
	editButton.textContent = "Edit";

	const deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.className = "btn btn-outline-danger btn-sm";
	deleteButton.dataset.action = "delete";
	deleteButton.dataset.key = entry.translationKey;
	deleteButton.textContent = "Delete";

	actionsCell.appendChild(editButton);
	actionsCell.appendChild(deleteButton);

	row.appendChild(keyCell);
	row.appendChild(valueCell);
	row.appendChild(updatedCell);
	row.appendChild(actionsCell);

	return row;
}

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
	if (isLoading && !cachedEntries.length) {
		showMessageRow(texts.loading);
	}
}

function showNotice(text: string, variant: "success" | "danger" = "success") {
	notice.innerHTML = "";
	const alert = document.createElement("div");
	alert.className = `alert alert-${variant} mb-0`;
	alert.setAttribute("role", "alert");
	alert.textContent = text;
	notice.appendChild(alert);
}

async function createEntry(payload: TranslationEntryPayload): Promise<void> {
	const response = await fetch(apiBase, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ key: payload.key, value: payload.value }),
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({} as Record<string, unknown>))) ?? {};
		throw new Error(body?.error ?? messages.error);
	}
}

async function updateEntry(key: string, nextValue: string): Promise<void> {
	const response = await fetch(`${apiBase}/${encodeURIComponent(key)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ value: nextValue }),
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({} as Record<string, unknown>))) ?? {};
		throw new Error(body?.error ?? messages.error);
	}
}

async function deleteEntry(key: string): Promise<void> {
	const response = await fetch(`${apiBase}/${encodeURIComponent(key)}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		const body = (await response.json().catch(() => ({} as Record<string, unknown>))) ?? {};
		throw new Error(body?.error ?? messages.error);
	}
}

function handleError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return messages.error;
}
