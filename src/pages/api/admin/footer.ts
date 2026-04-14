import type { APIRoute } from "astro";
import { getDb } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/footer" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const formData = await request.formData();
		const rawTemplate = formData.get("footerTemplateHtml");
		const footerTemplateHtml = typeof rawTemplate === "string" ? rawTemplate : "";
		await getDb(locals)
			.prepare(
				`INSERT INTO footer_settings (id, footer_template_html)
				VALUES (1, ?1)
				ON CONFLICT(id) DO UPDATE SET
					footer_template_html = excluded.footer_template_html,
					updated_at = CURRENT_TIMESTAMP`,
			)
			.bind(footerTemplateHtml)
			.run();

		return redirect("/admin/footer?saved=1");
	} catch {
		return redirect("/admin/footer?error=1");
	}
};
