import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const secureFlag = new URL(request.url).protocol === "https:" ? "; Secure" : "";

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/admin/login",
			"Set-Cookie": `cms_admin_token=; Path=/; HttpOnly; SameSite=Strict${secureFlag}; Max-Age=0`,
		},
	});
};
