import type { APIRoute } from "astro";
import {
	getDb,
	getPostById,
	parsePostForm,
	parsePostPayload,
	toAdminPostDetail,
	updatePost,
} from "../../../../lib/blog";
import { getLanguageCatalog, getSupportedLanguages } from "../../../../lib/i18n";
import { requireApiPermission } from "../../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["posts.read"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
	);
	if (session instanceof Response) {
		return session;
	}

	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) {
		return Response.json({ error: "Post not found." }, { status: 404 });
	}

	const catalog = getLanguageCatalog(locals);
	const post = await getPostById(getDb(locals), id, undefined, catalog);
	if (!post) {
		return Response.json({ error: "Post not found." }, { status: 404 });
	}

	const language = locals.uiLanguage ?? catalog.defaultLanguageCode;
	return Response.json({
		languages: getSupportedLanguages(catalog),
		post: toAdminPostDetail(post, language, catalog),
	});
};

export const POST: APIRoute = async ({ params, locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["posts.update"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
	);
	if (session instanceof Response) {
		return session;
	}

	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) {
		return redirect("/admin/posts?error=1");
	}

	try {
		const catalog = getLanguageCatalog(locals);
		const defLang = catalog.defaultLanguageCode;
		const isJsonRequest = request.headers.get("content-type")?.includes("application/json") ?? false;
		const input = isJsonRequest
			? parsePostPayload(await request.json(), defLang)
			: parsePostForm(await request.formData(), defLang);
		await updatePost(getDb(locals), id, input);
		if (isJsonRequest) {
			return Response.json({
				postId: id,
				redirectTo: "/admin/posts?saved=1",
				message: "Post saved.",
			});
		}
		return redirect("/admin/posts?saved=1");
	} catch {
		return redirect(`/admin/posts/${id}/edit?error=1`);
	}
};
