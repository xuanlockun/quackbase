import { describe, expect, it } from "vitest";
import { ADMIN_NAV_ITEMS, getRequiredAdminPagePermissions } from "../../src/lib/rbac/policies";
import { ADMIN_PERMISSIONS } from "../../src/lib/rbac/permissions";

describe("admin RBAC contract coverage", () => {
	it("keeps the seeded permission catalog aligned with the documented resources", () => {
		expect(ADMIN_PERMISSIONS.map((permission) => permission.name)).toEqual([
			"posts.read",
			"posts.create",
			"posts.update",
			"posts.delete",
			"pages.read",
			"pages.create",
			"pages.update",
			"pages.delete",
			"site.manage",
			"users.manage",
			"roles.manage",
			"permissions.read",
		]);
	});

	it("protects each admin page route with an explicit permission policy", () => {
		for (const route of ["/admin", ...ADMIN_NAV_ITEMS.map((item) => item.href)]) {
			expect(getRequiredAdminPagePermissions(route)).not.toBeNull();
		}
	});
});
