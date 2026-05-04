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

	it("renders logo grid blocks inside page content markdown", () => {
		const html = renderMarkdown(`::: logo-grid
eyebrow: Partners and Clients
title: Our Partners & Clients
body: Trusted by teams across multiple industries.
- https://ncs.vn/wp-content/uploads/2020/03/client4.png
- https://ncs.vn/wp-content/uploads/2020/03/client5.svg
:::`);

		expect(html).toContain('class="logo-grid-section"');
		expect(html).toContain("Our Partners &amp; Clients");
		expect(html).toContain('class="logo-grid-item"');
		expect(html).toContain("client4.png");
	});

	it("renders showcase split blocks inside page content markdown", () => {
		const html = renderMarkdown(`::: showcase-split
eyebrow: Why Choose Us
title: Your Partner for Software Innovation
body: We help businesses elevate their value through software development and consultancy services.
image: https://ncs.vn/wp-content/uploads/2020/02/image1-home1.png
alt: Software innovation illustration
:::`);

		expect(html).toContain('class="showcase-split-section"');
		expect(html).toContain("Your Partner for Software Innovation");
		expect(html).toContain("Software innovation illustration");
		expect(html).toContain("image1-home1.png");
	});
});
