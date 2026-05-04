import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

type MarkdownEditorHost = HTMLTextAreaElement & {
	_markdownEditor?: EasyMDE;
};

const syncTextarea = (textarea: MarkdownEditorHost, value: string) => {
	if (textarea.value === value) {
		return;
	}

	textarea.value = value;
	textarea.dispatchEvent(new Event("input", { bubbles: true }));
	textarea.dispatchEvent(new Event("change", { bubbles: true }));
};

const initMarkdownEditor = (textarea: MarkdownEditorHost) => {
	if (textarea._markdownEditor || textarea.disabled) {
		return;
	}

	if (textarea.closest("[hidden]")) {
		return;
	}

	const editor = new EasyMDE({
		element: textarea,
		autoDownloadFontAwesome: false,
		forceSync: true,
		spellChecker: false,
		status: false,
		toolbarTips: true,
		minHeight: "340px",
		placeholder: "Write in Markdown...",
		showIcons: ["code", "table", "horizontal-rule"],
		hideIcons: ["image", "side-by-side", "fullscreen", "guide"],
		renderingConfig: {
			singleLineBreaks: false,
		},
	});

	editor.codemirror.on("change", () => {
		syncTextarea(textarea, editor.value());
	});

	textarea._markdownEditor = editor;
	const wrapper = textarea.closest(".editor-toolbar, .EasyMDEContainer")?.parentElement;
	if (wrapper instanceof HTMLElement) {
		wrapper.classList.add("admin-markdown-editor");
	}
};

const initMarkdownEditors = (root: ParentNode = document) => {
	root.querySelectorAll("[data-content-input]").forEach((element) => {
		if (element instanceof HTMLTextAreaElement) {
			initMarkdownEditor(element as MarkdownEditorHost);
		}
	});
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => initMarkdownEditors());
} else {
	initMarkdownEditors();
}

document.addEventListener("click", (event) => {
	const target = event.target;
	if (!(target instanceof HTMLElement)) {
		return;
	}

	const tab = target.closest("[data-language-tab]");
	if (!(tab instanceof HTMLElement)) {
		return;
	}

	window.setTimeout(() => {
		const root = tab.closest("[data-markdown-editor-root]");
		if (root instanceof HTMLElement) {
			initMarkdownEditors(root);
		}
	}, 0);
});
