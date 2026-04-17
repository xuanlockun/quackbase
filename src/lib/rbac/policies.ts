import type { AdminSession } from "../auth/types";

export interface AdminNavItem {
	href: string;
	labelKey: string;
	permissions: string[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
	{ href: "/admin", labelKey: "nav.dashboard", permissions: [] },
	{ href: "/admin/posts", labelKey: "nav.posts", permissions: ["posts.read"] },
	{ href: "/admin/pages", labelKey: "nav.pages", permissions: ["pages.read"] },
	{ href: "/admin/media", labelKey: "nav.media", permissions: ["site.manage"] },
	{ href: "/admin/banners", labelKey: "nav.banners", permissions: ["banners.read"] },
	{ href: "/admin/contact-forms", labelKey: "nav.contactForms", permissions: ["contactForms.read"] },
	{ href: "/admin/backup", labelKey: "nav.backup", permissions: ["site.manage"] },
	{ href: "/admin/templates", labelKey: "nav.template", permissions: ["site.manage"] },
	{ href: "/admin/footer", labelKey: "nav.footer", permissions: ["site.manage"] },
	{ href: "/admin/settings", labelKey: "nav.settings", permissions: ["site.manage"] },
	{ href: "/admin/users", labelKey: "nav.users", permissions: ["users.manage"] },
	{ href: "/admin/roles", labelKey: "nav.roles", permissions: ["roles.manage"] },
	{ href: "/admin/languages", labelKey: "nav.languages", permissions: ["languages.manage"] },
];

const ADMIN_PAGE_POLICIES = new Map<string, string[]>([
	["/admin", []],
	["/admin/posts", ["posts.read"]],
	["/admin/pages", ["pages.read"]],
	["/admin/media", ["site.manage"]],
	["/admin/banners", ["banners.read"]],
	["/admin/contact-forms", ["contactForms.read"]],
	["/admin/backup", ["site.manage"]],
	["/admin/footer", ["site.manage"]],
	["/admin/templates", ["site.manage"]],
	["/admin/templates/header", ["site.manage"]],
	["/admin/templates/navbar", ["site.manage"]],
	["/admin/templates/page", ["site.manage"]],
	["/admin/templates/footer", ["site.manage"]],
	["/admin/settings", ["site.manage"]],
	["/admin/users", ["users.manage"]],
	["/admin/roles", ["roles.manage"]],
	["/admin/languages", ["languages.manage"]],
]);

export function getRequiredAdminPagePermissions(pathname: string): string[] | null {
	if (!pathname.startsWith("/admin")) {
		return null;
	}

	if (pathname === "/admin/posts/new") {
		return ["posts.create"];
	}

	if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname)) {
		return ["posts.update"];
	}

	if (pathname === "/admin/pages/new") {
		return ["pages.create"];
	}

	if (pathname === "/admin/media") {
		return ["site.manage"];
	}

	if (pathname === "/admin/banners/new") {
		return ["banners.manage"];
	}

	if (/^\/admin\/pages\/[^/]+\/edit$/.test(pathname)) {
		return ["pages.update"];
	}

	if (/^\/admin\/banners\/[^/]+\/edit$/.test(pathname)) {
		return ["banners.manage"];
	}

	if (pathname === "/admin/contact-forms/new") {
		return ["contactForms.manage"];
	}

	if (/^\/admin\/contact-forms\/[^/]+\/edit$/.test(pathname)) {
		return ["contactForms.manage"];
	}

	if (/^\/admin\/contact-forms\/[^/]+\/leads$/.test(pathname)) {
		return ["contactForms.read"];
	}

	if (pathname === "/admin/users/new" || /^\/admin\/users\/[^/]+\/edit$/.test(pathname)) {
		return ["users.manage"];
	}

	if (pathname === "/admin/templates") {
		return ["site.manage"];
	}

	if (pathname === "/admin/roles/new" || /^\/admin\/roles\/[^/]+\/edit$/.test(pathname)) {
		return ["roles.manage"];
	}

	if (/^\/admin\/templates\/(header|navbar|page|footer)$/.test(pathname)) {
		return ["site.manage"];
	}

	return ADMIN_PAGE_POLICIES.get(pathname) ?? [];
}

export function sessionHasPermissions(
	session: AdminSession | null,
	requiredPermissions: readonly string[] = [],
): boolean {
	if (!session) {
		return false;
	}

	if (requiredPermissions.length === 0) {
		return session.roles.length > 0;
	}

	if (session.isSuperadmin) {
		return true;
	}

	return requiredPermissions.every((permission) => session.permissions.includes(permission));
}

export function getDefaultAdminPath(session: AdminSession | null): string {
	if (!session) {
		return "/admin/login";
	}

	return "/admin";
}

export function getVisibleAdminNavItems(session: AdminSession | null): AdminNavItem[] {
	return ADMIN_NAV_ITEMS.filter((item) => sessionHasPermissions(session, item.permissions));
}
