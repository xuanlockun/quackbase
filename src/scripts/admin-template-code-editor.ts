import { basicSetup, EditorView } from "codemirror";
import { html } from "@codemirror/lang-html";

type TemplateEditorHost = HTMLTextAreaElement & {
	_codeMirrorView?: EditorView;
};

const syncTextarea = (textarea: TemplateEditorHost, value: string) => {
	if (textarea.value === value) {
		return;
	}

	textarea.value = value;
	textarea.dispatchEvent(new Event("input", { bubbles: true }));
	textarea.dispatchEvent(new Event("change", { bubbles: true }));
};

const initTemplateEditor = () => {
	const textarea = document.querySelector(".template-editor-textarea");
	if (!(textarea instanceof HTMLTextAreaElement) || textarea.disabled) {
		return;
	}

	const host = textarea as TemplateEditorHost;
	if (host._codeMirrorView) {
		return;
	}

	const shell = textarea.closest(".admin-editor-shell");
	if (!(shell instanceof HTMLElement)) {
		return;
	}

	const mount = document.createElement("div");
	mount.className = "admin-code-editor";
	textarea.before(mount);

	const view = new EditorView({
		doc: textarea.value,
		parent: mount,
		extensions: [
			basicSetup,
			html(),
			EditorView.lineWrapping,
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					syncTextarea(host, update.state.doc.toString());
				}
			}),
		],
	});

	textarea.hidden = true;
	textarea.classList.add("admin-editor-textarea--enhanced");
	host._codeMirrorView = view;
	shell.dataset.editorEnhanced = "true";
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initTemplateEditor);
} else {
	initTemplateEditor();
}
