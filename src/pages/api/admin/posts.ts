import type { APIRoute } from "astro";
import {
	createPost,
	getDb,
	listAllPosts,
	parsePostForm,
	parsePostPayload,
	toAdminPostSummary,
	updatePost,
} from "../../../lib/blog";
import { getLanguageCatalog, getLocalizedPostPath, getSupportedLanguages } from "../../../lib/i18n";
import { requireApiPermission } from "../../../lib/rbac/guards";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["posts.read"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
	);
	if (session instanceof Response) {
		return session;
	}

	try {
		const catalog = getLanguageCatalog(locals);
		const language = locals.uiLanguage ?? catalog.defaultLanguageCode;
		const posts = await listAllPosts(getDb(locals), language, catalog);
		return Response.json({
			languages: getSupportedLanguages(catalog),
			posts: posts.map((post) => toAdminPostSummary(post, language, catalog)),
		});
	} catch {
		return Response.json({ error: "Failed to load posts." }, { status: 500 });
	}
};

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	try {
		const isJsonRequest = request.headers.get("content-type")?.includes("application/json") ?? false;
		const formData = isJsonRequest ? null : await request.formData();
		const payload = isJsonRequest ? await request.json() : null;
		const idValue = formData?.get("id");
		const requiredPermission =
			typeof idValue === "string" && idValue.trim() !== "" ? "posts.update" : "posts.create";
		const session = await requireApiPermission(
			{ locals, request, redirect },
			[requiredPermission],
			{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/posts" },
		);
		if (session instanceof Response) {
			return session;
		}

		const db = getDb(locals);
		const catalog = getLanguageCatalog(locals);
		const defLang = catalog.defaultLanguageCode;
		const input = isJsonRequest
			? parsePostPayload(payload, defLang)
			: parsePostForm(formData as FormData, defLang);

		if (typeof idValue === "string" && idValue.trim() !== "") {
			await updatePost(db, Number(idValue), input);
			if (isJsonRequest) {
				return Response.json({
					postId: Number(idValue),
					redirectTo: "/admin/posts?saved=1",
					message: "Post saved.",
				});
			}
			return redirect(
				`/admin/posts?slug=${encodeURIComponent(getLocalizedPostPath(input.slugTranslations, defLang, catalog))}&saved=1`,
			);
		}

		const postId = await createPost(db, input);
		if (isJsonRequest) {
			return Response.json({
				postId,
				redirectTo: "/admin/posts?saved=1",
				message: "Post created.",
			}, { status: 201 });
		}
		return redirect(`/admin/posts?saved=1`);
	} catch {
		return redirect("/admin/posts/new?error=1");
	}
};
