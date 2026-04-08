import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getDb, getLocalizedPostPath, listPublishedPosts } from "../lib/blog";
import { loadLanguageCatalog } from "../lib/languages";

export const prerender = false;

export async function GET(context) {
	const db = getDb(context.locals);
	const catalog = await loadLanguageCatalog(db);
	const lang = catalog.defaultLanguageCode;
	const posts = await listPublishedPosts(db, lang, catalog);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.pubDate,
			link: getLocalizedPostPath(post.slugTranslations, lang, catalog),
		})),
	});
}
