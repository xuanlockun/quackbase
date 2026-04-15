import type { APIRoute } from "astro";
import { getDb, getSiteConfig, saveSiteConfig } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

function parseNavItems(formData: FormData) {
	const raw = formData.get("navItems");
	if (typeof raw !== "string" || raw.trim() === "") {
		return [];
	}

	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) {
		throw new Error("Invalid navigation payload.");
	}

	return parsed;
}

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/pages" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const db = getDb(locals);
		const formData = await request.formData();
		const siteConfig = await getSiteConfig(db);
		const navItems = parseNavItems(formData);
		await saveSiteConfig(db, {
			siteTitle: siteConfig.siteTitle,
			homePageSlug: siteConfig.homePageSlug,
			faviconUrl: siteConfig.faviconUrl,
			logoUrl: siteConfig.logoUrl,
			headerBackground: siteConfig.headerBackground,
			headerTextColor: siteConfig.headerTextColor,
			headerAccentColor: siteConfig.headerAccentColor,
			footerBackground: siteConfig.footerBackground,
			footerTextColor: siteConfig.footerTextColor,
			navItems,
		});
		return redirect("/admin/pages?navSaved=1");
	} catch {
		return redirect("/admin/pages?navError=1");
	}
};
