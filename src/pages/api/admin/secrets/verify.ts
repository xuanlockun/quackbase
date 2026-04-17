import type { APIRoute } from "astro";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/settings", forceJson: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const env = locals.runtime.env as Record<string, string | undefined>;
		const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
		if (!accountId) {
			return Response.json(
				{
					ok: false,
					error: "Cloudflare account ID is not configured.",
				},
				{ status: 500 },
			);
		}

		const body = request.headers.get("content-type")?.includes("application/json")
			? await request.json()
			: Object.fromEntries(await request.formData());
		const secretValue = String((body as Record<string, unknown>).secretValue ?? "").trim();
		if (!secretValue) {
			return Response.json({ ok: false, error: "Token is required." }, { status: 400 });
		}

		const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${secretValue}`,
				Accept: "application/json",
			},
		});

		const payload = (await response.json().catch(() => null)) as {
			success?: boolean;
			result?: { id?: string; status?: string; expires_on?: string; not_before?: string };
			errors?: Array<{ message?: string }>;
		} | null;

		if (!response.ok || !payload?.success || !payload.result) {
			const message = payload?.errors?.[0]?.message || "Token verification failed.";
			return Response.json(
				{
					ok: false,
					error: message,
					cloudflareStatus: response.status || 400,
				},
				{ status: 200 },
			);
		}

		return Response.json({
			ok: true,
			status: payload.result.status ?? "active",
			tokenId: payload.result.id ?? "",
			expiresOn: payload.result.expires_on ?? null,
			notBefore: payload.result.not_before ?? null,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Token verification failed.";
		return Response.json({ ok: false, error: message }, { status: 500 });
	}
};
