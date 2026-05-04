import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

type MarkdownEditorHost = HTMLTextAreaElement & {
	_markdownEditor?: Editor;
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

	const shell = textarea.closest(".admin-editor-shell");
	if (!(shell instanceof HTMLElement)) {
		return;
	}

	const mount = document.createElement("div");
	mount.className = "admin-markdown-editor";
	textarea.before(mount);

	const editor = new Editor({
		el: mount,
		initialValue: textarea.value,
		initialEditType: "markdown",
		previewStyle: window.matchMedia("(max-width: 991px)").matches ? "tab" : "vertical",
		height: "420px",
		usageStatistics: false,
		hideModeSwitch: false,
		autofocus: false,
		toolbarItems: [
			["heading", "bold", "italic", "strike"],
			["hr", "quote"],
			["ul", "ol", "task"],
			["table", "link"],
			["code", "codeblock"],
		],
	});

	editor.on("change", () => {
		syncTextarea(textarea, editor.getMarkdown());
	});

	textarea.hidden = true;
	textarea.classList.add("admin-editor-textarea--enhanced");
	textarea._markdownEditor = editor;
	shell.dataset.editorEnhanced = "true";
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
