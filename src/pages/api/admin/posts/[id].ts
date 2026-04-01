import type { APIRoute } from "astro";
import {
	getDb,
	getPostById,
	parsePostForm,
	toAdminPostDetail,
	updatePost,
} from "../../../../lib/blog";
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

	const post = await getPostById(getDb(locals), id);
	if (!post) {
		return Response.json({ error: "Post not found." }, { status: 404 });
	}

	return Response.json({ post: toAdminPostDetail(post) });
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
		const formData = await request.formData();
		const input = parsePostForm(formData);
		await updatePost(getDb(locals), id, input);
		return redirect("/admin/posts?saved=1");
	} catch {
		return redirect(`/admin/posts/${id}/edit?error=1`);
	}
};
