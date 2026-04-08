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
		const body = (await request.json()) as Record<string, unknown>;
		const code = typeof body.code === "string" ? body.code.trim() : "";
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
			enabled: body.enabled === false ? false : true,
			isDefault: body.isDefault === true,
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
		const message = error instanceof Error ? error.message : "Unable to create language.";
		return Response.json({ error: message }, { status: 400 });
	}
};
