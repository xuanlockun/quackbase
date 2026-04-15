import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/lib/blog";

describe("markdown column blocks", () => {
	it("renders multi-column layout blocks while preserving markdown inside each column", () => {
		const html = renderMarkdown(`# Intro

::: columns
::: column
Left **bold**
:::

::: column
Right [link](https://example.com)
:::
:::`);

		expect(html).toContain("<h1>Intro</h1>");
		expect(html).toContain('class="cms-columns"');
		expect(html).toContain('data-cms-columns-count="2"');
		expect(html).toContain('<div class="cms-column"><p>Left <strong>bold</strong></p>');
		expect(html).toContain('<div class="cms-column"><p>Right <a href="https://example.com">link</a></p>');
	});
});
