/**
 * @typedef {{ code: string; label: string }} TranslationLanguage
 */

(function initTranslationManager() {
	const form = document.querySelector("[data-translation-form]");
	const notice = document.querySelector("[data-translation-notice]");
	const localeSelect = document.querySelector("[data-translation-locale-select]");

	if (!form || !notice) {
		throw new Error("Translation manager could not find required elements.");
	}

	const formDataset = form.dataset;
	const locale = (localeSelect instanceof HTMLSelectElement && localeSelect.value) || formDataset.currentLocale || "";
	if (!locale) {
		throw new Error("Locale context is missing.");
	}

	const apiBaseTemplate = formDataset.apiBaseTemplate ?? "/api/admin/languages/__locale__/translations";
	const editingKey = formDataset.editingKey ?? "";
	const routeTemplate = formDataset.routeTemplate ?? "";
	const keyInput = form.querySelector("[name='key']");
	const submitButton = form.querySelector("[data-translation-submit]");
	const tabButtons = Array.from(form.querySelectorAll("[data-translation-tab]"));
	const tabPanels = new Map(
		Array.from(form.querySelectorAll("[data-translation-panel]")).map((panel) => [
			panel.dataset.translationPanel,
			panel,
		]),
	);

	if (!(keyInput instanceof HTMLInputElement) || !(submitButton instanceof HTMLButtonElement) || tabButtons.length === 0 || tabPanels.size === 0) {
		throw new Error("Translation manager is missing form controls.");
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
		createSuccess: formDataset.textCreateSuccess ?? "Translation added.",
		updateSuccess: formDataset.textUpdateSuccess ?? "Translation saved.",
		error: formDataset.messageError ?? "Unable to process the request.",
		requiredKey: formDataset.textRequiredKey ?? "Translation key is required.",
		requiredValues: formDataset.textRequiredValues ?? "Enter at least one translation value.",
	};

	const texts = {
		addButton: formDataset.textAddButton ?? "Create translation entry",
		saveButton: formDataset.textSaveButton ?? "Save changes",
	};

	let currentLocale = locale;
	let currentTab = tabButtons.find((button) => button.classList.contains("active"))?.dataset.translationTab ?? languages[0]?.code;
	if (currentTab) {
		setActiveTab(currentTab);
	}

	if (editingKey) {
		setSubmitMode("edit");
		fillInitialTranslations();
	} else {
		setSubmitMode("create");
	}

	localeSelect?.addEventListener("change", () => {
		if (!(localeSelect instanceof HTMLSelectElement) || !localeSelect.value || localeSelect.value === currentLocale) {
			return;
		}
		currentLocale = localeSelect.value;
		updateLocaleUrl(currentLocale);
		if (languages.some((language) => language.code === currentLocale)) {
			setActiveTab(currentLocale);
		}
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const payload = readFormPayload();
		if (!payload.key) {
			showNotice(messages.requiredKey, "danger");
			return;
		}

		if (!hasAnyTranslation(payload.translations)) {
			showNotice(messages.requiredValues, "danger");
			return;
		}

		try {
			await createEntry(payload);
			showNotice(editingKey ? messages.updateSuccess : messages.createSuccess, "success");
			resetForm();
		} catch (error) {
			showNotice(handleError(error), "danger");
		}
	});

	for (const button of tabButtons) {
		button.addEventListener("click", () => {
			const code = button.dataset.translationTab;
			if (code) {
				setActiveTab(code);
			}
		});
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

	async function createEntry(payload) {
		const response = await fetch(getApiBase(currentLocale), {
			method: editingKey ? "PATCH" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: payload.key, translations: payload.translations }),
		});
		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) ?? {};
			throw new Error(body?.error ?? messages.error);
		}
	}

	function resetForm() {
		if (!editingKey) {
			keyInput.value = "";
			for (const language of languages) {
				const input = form.querySelector(`[name="value-${cssEscape(language.code)}"]`);
				if (input) {
					input.value = "";
				}
			}
		}
		if (currentTab) {
			setActiveTab(currentTab);
		}
		keyInput.focus();
	}

	function fillInitialTranslations() {
		let bundle = {};
		try {
			bundle = JSON.parse(formDataset.initialTranslations ?? "{}");
		} catch {
			bundle = {};
		}

		for (const language of languages) {
			const input = form.querySelector(`[name="value-${cssEscape(language.code)}"]`);
			if (!(input instanceof HTMLTextAreaElement)) {
				continue;
			}
			input.value = String(bundle?.[language.code] ?? "");
		}
	}

	function setActiveTab(code) {
		currentTab = code;
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
		const key = editingKey ? encodeURIComponent(editingKey) : "";
		return apiBaseTemplate
			.replace("__locale__", encodeURIComponent(nextLocale || currentLocale))
			.replace("__key__", key);
	}

	function updateLocaleUrl(nextLocale) {
		const url = new URL(window.location.href);
		if (routeTemplate && editingKey) {
			const path = routeTemplate
				.replace("__locale__", encodeURIComponent(nextLocale))
				.replace("__key__", encodeURIComponent(editingKey));
			url.pathname = path;
			url.search = "";
			url.hash = "";
		} else {
			url.searchParams.set("locale", nextLocale);
			url.hash = "translations";
		}
		window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
	}

	function setSubmitMode(mode) {
		if (!submitButton) {
			return;
		}
		submitButton.textContent = mode === "edit" ? texts.saveButton : texts.addButton;
	}

	function showNotice(text, variant = "success") {
		notice.innerHTML = "";
		const alert = document.createElement("div");
		alert.className = `alert alert-${variant} mb-0`;
		alert.setAttribute("role", "alert");
		alert.textContent = text;
		notice.appendChild(alert);
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
})();
