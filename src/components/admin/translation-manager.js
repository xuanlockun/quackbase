/**
 * @typedef {{ code: string; label: string; isActive?: boolean }} TranslationLanguage
 * @typedef {{ translationKey: string; translations: Record<string, string>; updatedAt: string | null }} TranslationBundleRecord
 */

(function initTranslationManager() {
	const table = document.querySelector("[data-translation-table]");
	const form = document.querySelector("[data-translation-form]");
	const notice = document.querySelector("[data-translation-notice]");
	const localeSelect = document.querySelector("[data-translation-locale-select]");

	if (!table || !form || !notice) {
		throw new Error("Translation manager could not find required elements.");
	}

	const dataset = table.dataset;
	const formDataset = form.dataset;
	let locale = (localeSelect instanceof HTMLSelectElement && localeSelect.value) || dataset.locale || "";
	if (!locale) {
		throw new Error("Locale context is missing.");
	}

	const apiBaseTemplate = dataset.apiBaseTemplate ?? dataset.apiBase ?? "/api/admin/languages/__locale__/translations";
	const columnCount = table.querySelectorAll("thead th").length || 4;
	const tbody = table.querySelector("tbody");
	const keyInput = form.querySelector("[name='key']");
	const submitButton = form.querySelector("[data-translation-submit]");
	const cancelButton = form.querySelector("[data-translation-cancel]");
	const tabButtons = Array.from(form.querySelectorAll("[data-translation-tab]"));
	const tabPanels = new Map(
		Array.from(form.querySelectorAll("[data-translation-panel]")).map((panel) => [
			panel.dataset.translationPanel,
			panel,
		]),
	);

	if (!tbody || !keyInput || !submitButton || !cancelButton || tabButtons.length === 0 || tabPanels.size === 0) {
		throw new Error("Translation manager is missing form controls.");
	}

	if (localeSelect instanceof HTMLSelectElement && !localeSelect.value && locale) {
		localeSelect.value = locale;
	}

	/** @type {TranslationLanguage[]} */
	let languages = [];
	try {
		const parsed = JSON.parse(formDataset.languageTabs ?? "[]");
		if (Array.isArray(parsed)) {
			languages = parsed
				.map((entry) => ({
					code: String(entry?.code ?? "").trim().toLowerCase(),
					label: String(entry?.label ?? "").trim() || String(entry?.code ?? "").trim().toUpperCase(),
					isActive: Boolean(entry?.isActive),
				}))
				.filter((entry) => entry.code);
		}
	} catch {
		languages = [];
	}

	if (!languages.length) {
		languages = tabButtons
			.map((button) => ({
				code: String(button.dataset.translationTab ?? "").trim().toLowerCase(),
				label: button.textContent?.trim() || button.dataset.translationTab || "",
			}))
			.filter((entry) => entry.code);
	}

	const messages = {
		createSuccess: dataset.messageCreateSuccess ?? "Translations added.",
		updateSuccess: dataset.messageUpdateSuccess ?? "Translations updated.",
		deleteSuccess: dataset.messageDeleteSuccess ?? "Translation deleted.",
		error: dataset.messageError ?? "Unable to process the request.",
	};

	const texts = {
		empty: dataset.textEmpty ?? "No translations yet for this locale.",
		loading: dataset.textLoading ?? "Loading translations...",
		addButton: formDataset.textAddButton ?? "Add translations",
		saveButton: formDataset.textSaveButton ?? "Save changes",
		cancelButton: formDataset.textCancelButton ?? "Cancel",
	};

	let cachedEntries = [];
	let editingKey = "";
	let isChangingLocale = false;

	const initialTab = tabButtons.find((button) => button.classList.contains("active"))?.dataset.translationTab ?? languages[0]?.code;
	if (initialTab) {
		setActiveTab(initialTab);
	}
	resetEditorState();

	localeSelect?.addEventListener("change", () => {
		if (!(localeSelect instanceof HTMLSelectElement) || !localeSelect.value || localeSelect.value === locale) {
			return;
		}
		locale = localeSelect.value;
		isChangingLocale = true;
		refreshEntries()
			.then(() => {
				resetEditorState();
				updateLocaleUrl(locale);
			})
			.catch((error) => showNotice(handleError(error), "danger"))
			.finally(() => {
				isChangingLocale = false;
			});
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const payload = readFormPayload();
		const wasEditing = Boolean(editingKey);
		if (!payload.key) {
			showNotice("Translation key is required.", "danger");
			return;
		}

		if (!hasAnyTranslation(payload.translations)) {
			showNotice("Enter at least one translation value.", "danger");
			return;
		}

		try {
			await saveBundle(payload);
			resetEditorState();
			showNotice(wasEditing ? messages.updateSuccess : messages.createSuccess, "success");
			await refreshEntries();
		} catch (error) {
			showNotice(handleError(error), "danger");
		}
	});

	cancelButton.addEventListener("click", () => {
		resetEditorState();
		showNotice("Edit cancelled.", "success");
	});

	for (const button of tabButtons) {
		button.addEventListener("click", () => {
			const code = button.dataset.translationTab;
			if (code) {
				setActiveTab(code);
			}
		});
	}

	table.addEventListener("click", (event) => {
		const target = event.target?.closest?.("[data-action]");
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
			loadEntryIntoEditor(key).catch((error) => showNotice(handleError(error), "danger"));
			return;
		}

		if (action === "delete") {
			const confirmed = window.confirm("Delete this translation entry?");
			if (!confirmed) {
				return;
			}
			deleteEntry(key)
				.then(() => {
					if (editingKey === key) {
						resetEditorState();
					}
					showNotice(messages.deleteSuccess, "success");
					refreshEntries().catch((error) => showNotice(handleError(error), "danger"));
				})
				.catch((error) => showNotice(handleError(error), "danger"));
		}
	});

	refreshEntries().catch((error) => showNotice(handleError(error), "danger"));

	async function refreshEntries() {
		setLoadingState(true);
		try {
			const response = await fetch(getApiBase(locale));
			if (!response.ok) {
				throw new Error(messages.error);
			}
			const body = (await response.json().catch(() => ({}))) ?? {};
			if (!Array.isArray(body.entries)) {
				throw new Error(messages.error);
			}
			cachedEntries = body.entries.map((entry) => ({
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

	function renderRows(entries) {
		if (!entries.length) {
			showMessageRow(texts.empty);
			return;
		}

		tbody.innerHTML = "";
		for (const entry of entries) {
			tbody.appendChild(buildRow(entry));
		}
	}

	function buildRow(entry) {
		const row = document.createElement("tr");

		const keyCell = document.createElement("td");
		keyCell.innerHTML = `<code>${escapeHtml(entry.translationKey)}</code>`;

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

	function showMessageRow(text) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.colSpan = columnCount;
		cell.className = "text-center text-muted py-4 small";
		cell.textContent = text;
		row.appendChild(cell);
		tbody.innerHTML = "";
		tbody.appendChild(row);
	}

	function setLoadingState(isLoading) {
		table.dataset.loading = isLoading ? "true" : "false";
		if (isLoading && !cachedEntries.length) {
			showMessageRow(texts.loading);
		}
	}

	function showNotice(text, variant = "success") {
		notice.innerHTML = "";
		const alert = document.createElement("div");
		alert.className = `alert alert-${variant} mb-0`;
		alert.setAttribute("role", "alert");
		alert.textContent = text;
		notice.appendChild(alert);
	}

	function readFormPayload() {
		const key = String(keyInput.value ?? "").trim();
		/** @type {Record<string, string>} */
		const translations = {};

		for (const language of languages) {
			const input = form.querySelector(`[name="value-${cssEscape(language.code)}"]`);
			if (!input) {
				continue;
			}
			translations[language.code] = String(input.value ?? "").trim();
		}

		return { key, translations };
	}

	function hasAnyTranslation(translations) {
		return Object.values(translations).some((value) => value.trim().length > 0);
	}

	async function saveBundle(payload) {
		const endpoint = editingKey ? `${getApiBase(locale)}/${encodeURIComponent(editingKey)}` : getApiBase(locale);
		const method = editingKey ? "PATCH" : "POST";
		const response = await fetch(endpoint, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: payload.key, translations: payload.translations }),
		});
		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) ?? {};
			throw new Error(body?.error ?? messages.error);
		}
	}

	async function loadEntryIntoEditor(key) {
		setLoadingState(true);
		try {
			const response = await fetch(`${getApiBase(locale)}/${encodeURIComponent(key)}`);
			if (!response.ok) {
				throw new Error(messages.error);
			}
			const body = (await response.json().catch(() => ({}))) ?? {};
			const entry = body.entry;
			if (!entry || typeof entry !== "object") {
				throw new Error(messages.error);
			}

			editingKey = String(entry.translationKey ?? key).trim();
			keyInput.value = editingKey;
			keyInput.readOnly = true;
			setSubmitButtonMode("edit");

			for (const language of languages) {
				const input = form.querySelector(`[name="value-${cssEscape(language.code)}"]`);
				if (!input) {
					continue;
				}
				input.value = String(entry.translations?.[language.code] ?? "");
			}

			const preferredTab =
				locale && languages.some((language) => language.code === locale)
					? locale
					: languages.find((language) => String(entry.translations?.[language.code] ?? "").trim())?.code ??
						languages[0]?.code;
			if (preferredTab) {
				setActiveTab(preferredTab);
			}
			cancelButton.hidden = false;
			showNotice(`Editing ${editingKey}.`, "success");
		} finally {
			setLoadingState(false);
		}
	}

	async function deleteEntry(key) {
		const response = await fetch(`${getApiBase(locale)}/${encodeURIComponent(key)}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) ?? {};
			throw new Error(body?.error ?? messages.error);
		}
	}

	function resetEditorState() {
		editingKey = "";
		form.reset();
		keyInput.readOnly = false;
		setSubmitButtonMode("create");
		cancelButton.hidden = true;
		for (const language of languages) {
			const input = form.querySelector(`[name="value-${cssEscape(language.code)}"]`);
			if (input) {
				input.value = "";
			}
		}
		if (languages[0]?.code) {
			setActiveTab(languages[0].code);
		}
	}

	function setSubmitButtonMode(mode) {
		submitButton.textContent = mode === "edit" ? texts.saveButton : texts.addButton;
	}

	function setActiveTab(code) {
		for (const button of tabButtons) {
			const isActive = button.dataset.translationTab === code;
			button.classList.toggle("active", isActive);
			button.setAttribute("aria-selected", isActive ? "true" : "false");
		}

		for (const [panelCode, panel] of tabPanels.entries()) {
			const isActive = panelCode === code;
			panel.classList.toggle("d-none", !isActive);
		}
	}

	function getApiBase(nextLocale) {
		return apiBaseTemplate.replace("__locale__", encodeURIComponent(nextLocale || locale));
	}

	function updateLocaleUrl(nextLocale) {
		const url = new URL(window.location.href);
		url.searchParams.set("locale", nextLocale);
		url.hash = "translations";
		window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
	}

	function handleError(error) {
		if (error instanceof Error) {
			return error.message;
		}
		return messages.error;
	}

	function cssEscape(value) {
		if (window.CSS?.escape) {
			return window.CSS.escape(value);
		}
		return value.replace(/["\\]/g, "\\$&");
	}

	function escapeHtml(value) {
		return value
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");
	}
})();
