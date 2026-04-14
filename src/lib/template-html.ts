const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function renderTemplateHtml(templateHtml: string, replacements: Record<string, string>): string {
	const source = templateHtml.trim();
	if (!source) {
		return "";
	}

	return source.replace(TEMPLATE_PLACEHOLDER_PATTERN, (match, key: string) => {
		return Object.prototype.hasOwnProperty.call(replacements, key) ? replacements[key] : match;
	});
}
