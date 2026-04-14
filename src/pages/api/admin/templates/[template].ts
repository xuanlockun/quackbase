import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

const TEMPLATE_PATHS = new Set(["header", "navbar", "page", "footer"]);

export const POST: APIRoute = async ({ locals, request, redirect, params }) => {
	const template = params.template ?? "footer";
	if (!TEMPLATE_PATHS.has(template)) {
		return redirect("/admin/templates/footer?error=1");
	}

	if (template === "page") {
		return redirect("/admin/templates/page?error=readonly");
	}

	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: `/admin/templates/${template}` },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const rawTemplate = formData.get("templateHtml");
		const templateHtml = typeof rawTemplate === "string" ? rawTemplate : "";
		const db = getDb(locals);

		if (template === "footer") {
			await db
				.prepare(
					`INSERT INTO footer_settings (id, footer_template_html)
					VALUES (1, ?1)
					ON CONFLICT(id) DO UPDATE SET
						footer_template_html = excluded.footer_template_html,
						updated_at = CURRENT_TIMESTAMP`,
				)
				.bind(templateHtml)
				.run();
		} else if (template === "header") {
			await db
				.prepare(
					`INSERT INTO site_settings (id, header_template_html)
					VALUES (1, ?1)
					ON CONFLICT(id) DO UPDATE SET
						header_template_html = excluded.header_template_html,
						updated_at = CURRENT_TIMESTAMP`,
				)
				.bind(templateHtml)
				.run();
		} else if (template === "navbar") {
			await db
				.prepare(
					`INSERT INTO site_settings (id, navbar_template_html)
					VALUES (1, ?1)
					ON CONFLICT(id) DO UPDATE SET
						navbar_template_html = excluded.navbar_template_html,
						updated_at = CURRENT_TIMESTAMP`,
				)
				.bind(templateHtml)
				.run();
		}

		return redirect(`/admin/templates/${template}?saved=1`);
	} catch {
		return redirect(`/admin/templates/${template}?error=1`);
	}
};
