import type { AdminPermission } from "../auth/types";

export const ADMIN_PERMISSIONS: ReadonlyArray<Omit<AdminPermission, "id">> = [
	{ name: "posts.read", label: "View posts", description: "View blog post records.", resource: "posts", action: "read" },
	{ name: "posts.create", label: "Create posts", description: "Create blog posts.", resource: "posts", action: "create" },
	{ name: "posts.update", label: "Edit posts", description: "Edit blog posts.", resource: "posts", action: "update" },
	{ name: "posts.delete", label: "Delete posts", description: "Delete blog posts.", resource: "posts", action: "delete" },
	{ name: "pages.read", label: "View pages", description: "View site page records.", resource: "pages", action: "read" },
	{ name: "pages.create", label: "Create pages", description: "Create site pages.", resource: "pages", action: "create" },
	{ name: "pages.update", label: "Edit pages", description: "Edit site pages.", resource: "pages", action: "update" },
	{ name: "pages.delete", label: "Delete pages", description: "Delete site pages.", resource: "pages", action: "delete" },
	{
		name: "site.manage",
		label: "Manage site settings",
		description: "Update header, footer, and navigation settings.",
		resource: "site",
		action: "manage",
	},
	{ name: "users.manage", label: "Manage users", description: "Create and edit admin users.", resource: "users", action: "manage" },
	{ name: "roles.manage", label: "Manage roles", description: "Create and edit roles.", resource: "roles", action: "manage" },
	{
		name: "permissions.read",
		label: "View permissions",
		description: "View the permission catalog.",
		resource: "permissions",
		action: "read",
	},
];
