import { describe, expect, it } from "vitest";
import {
	clearAdminSessionCookie,
	createAdminSessionCookie,
	readAdminSessionCookie,
} from "../../src/lib/auth/cookies";
import { signAdminJwt, verifyAdminJwt } from "../../src/lib/auth/jwt";
import {
	getDefaultAdminPath,
	getRequiredAdminPagePermissions,
	sessionHasPermissions,
} from "../../src/lib/rbac/policies";
import type { AdminSession } from "../../src/lib/auth/types";

const SESSION: AdminSession = {
	userId: 7,
	email: "editor@example.com",
	displayName: "Editor Example",
	isActive: true,
	roles: [{ id: 2, name: "editor", label: "Editor" }],
	permissions: ["posts.read", "posts.create", "pages.read"],
	isSuperadmin: false,
};

describe("admin auth and RBAC helpers", () => {
	it("round-trips the signed admin session JWT", async () => {
		const token = await signAdminJwt(SESSION.userId, SESSION.email, "secret-value");
		await expect(verifyAdminJwt(token, "secret-value")).resolves.toEqual({
			userId: SESSION.userId,
			email: SESSION.email,
		});
	});

	it("reads and clears the HTTP-only session cookie", () => {
		const cookie = createAdminSessionCookie("token-value", "https://example.com/admin");
		const request = new Request("https://example.com/admin", { headers: { cookie } });
		expect(readAdminSessionCookie(request)).toBe("token-value");
		expect(clearAdminSessionCookie("https://example.com/admin")).toContain("Max-Age=0");
	});

	it("chooses the first permitted admin destination and enforces required permissions", () => {
		expect(getDefaultAdminPath(SESSION)).toBe("/admin/posts");
		expect(sessionHasPermissions(SESSION, ["posts.read"])).toBe(true);
		expect(sessionHasPermissions(SESSION, ["roles.manage"])).toBe(false);
		expect(getRequiredAdminPagePermissions("/admin/posts/new")).toEqual(["posts.create"]);
		expect(getRequiredAdminPagePermissions("/admin/posts/42/edit")).toEqual(["posts.update"]);
	});
});
