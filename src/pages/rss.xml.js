import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getDb, getLocalizedPostPath, listPublishedPosts } from "../lib/blog";

export const prerender = false;

export async function GET(context) {
	const posts = await listPublishedPosts(getDb(context.locals), "en");
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.pubDate,
			link: getLocalizedPostPath(post.slugTranslations, "en"),
		})),
	});
}
