import type { AdminSession } from "../auth/types";

export interface AdminNavItem {
	href: string;
	label: string;
	permissions: string[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
	{ href: "/admin/posts", label: "Posts", permissions: ["posts.read"] },
	{ href: "/admin/pages", label: "Pages", permissions: ["pages.read"] },
	{ href: "/admin/header", label: "Header", permissions: ["site.manage"] },
	{ href: "/admin/users", label: "Users", permissions: ["users.manage"] },
	{ href: "/admin/roles", label: "Roles", permissions: ["roles.manage"] },
	{ href: "/admin/permissions", label: "Permissions", permissions: ["permissions.read"] },
];

const ADMIN_PAGE_POLICIES = new Map<string, string[]>([
	["/admin", []],
	["/admin/posts", ["posts.read"]],
	["/admin/pages", ["pages.read"]],
	["/admin/header", ["site.manage"]],
	["/admin/users", ["users.manage"]],
	["/admin/roles", ["roles.manage"]],
	["/admin/permissions", ["permissions.read"]],
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

	const firstVisible = ADMIN_NAV_ITEMS.find((item) => sessionHasPermissions(session, item.permissions));
	return firstVisible?.href ?? "/admin/login?error=access-denied";
}

export function getVisibleAdminNavItems(session: AdminSession | null): AdminNavItem[] {
	return ADMIN_NAV_ITEMS.filter((item) => sessionHasPermissions(session, item.permissions));
}
