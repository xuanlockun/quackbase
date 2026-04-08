import type { APIRoute } from "astro";
import { getDb } from "../../../../lib/blog";
import {
	createLanguage,
	isValidLanguageCode,
	listAllLanguages,
	type CreateLanguageInput,
} from "../../../../lib/languages";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const languages = await listAllLanguages(getDb(locals));
		return Response.json({
			languages: languages.map((lang) => ({
				id: lang.id,
				code: lang.code,
				name: lang.name,
				enabled: lang.enabled,
				isDefault: lang.isDefault,
			})),
		});
	} catch {
		return Response.json({ error: "Failed to load languages." }, { status: 500 });
	}
};

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["languages.manage"],
		{ forceJson: true, clearCookieOnFailure: true },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const body = await parseLanguagePayload(request);
		const code = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";
		const name = typeof body.name === "string" ? body.name.trim() : "";
		if (!isValidLanguageCode(code)) {
			return Response.json({ error: "Invalid language code." }, { status: 400 });
		}
		if (!name) {
			return Response.json({ error: "Name is required." }, { status: 400 });
		}

		const input: CreateLanguageInput = {
			code,
			name,
			enabled: parseBoolean(body.enabled, true),
			isDefault: parseBoolean(body.isDefault, false),
		};

		const language = await createLanguage(getDb(locals), input);
		return Response.json(
			{
				language: {
					id: language.id,
					code: language.code,
					name: language.name,
					enabled: language.enabled,
					isDefault: language.isDefault,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		const message = friendlyCreateLanguageError(error);
		return Response.json({ error: message }, { status: 400 });
	}
};

function parseBoolean(value: unknown, fallback: boolean): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "false" || normalized === "0" || normalized === "") {
			return false;
		}
		return true;
	}

	return fallback;
}

async function parseLanguagePayload(request: Request): Promise<Record<string, unknown>> {
	const contentType = request.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		return (await request.json().catch(() => ({} as Record<string, unknown>))) ?? {};
	}

	const result: Record<string, unknown> = {};
	const formData = await request.formData().catch(() => new FormData());
	for (const [key, value] of formData.entries()) {
		result[key] = value;
	}

	return result;
}

function friendlyCreateLanguageError(error: unknown): string {
	if (error instanceof Error) {
		if (/unique/i.test(error.message)) {
			return "Language code already exists.";
		}
		return error.message;
	}

	return "Unable to create language.";
}
