import type { APIRoute } from "astro";
import { getAdminToken } from "../../../lib/blog";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const expectedToken = getAdminToken(locals);
	if (!expectedToken) {
		return redirect("/admin");
	}

	const formData = await request.formData();
	const token = formData.get("token");

	if (token !== expectedToken) {
		return redirect("/admin/login?error=invalid");
	}

	const secureFlag = new URL(request.url).protocol === "https:" ? "; Secure" : "";

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/admin",
			"Set-Cookie": `cms_admin_token=${encodeURIComponent(expectedToken)}; Path=/; HttpOnly; SameSite=Strict${secureFlag}`,
		},
	});
};
