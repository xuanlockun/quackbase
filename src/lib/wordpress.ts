export interface WordPressCollectionSummary {
	label: string;
	count: number | null;
	error: string | null;
}

export interface WordPressInspectionResult {
	siteUrl: string;
	baseApiUrl: string;
	items: WordPressCollectionSummary[];
}

const USER_AGENT = "edge-cms-wordpress-inspector";

export function normalizeWordPressSiteUrl(input: string): string {
	const value = input.trim();
	if (!value) {
		throw new Error("Please enter a WordPress site URL.");
	}

	const url = new URL(value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`);
	url.hash = "";
	url.search = "";
	url.pathname = url.pathname.replace(/\/+$/, "");
	return url.toString();
}

export async function inspectWordPressSite(siteInput: string): Promise<WordPressInspectionResult> {
	const siteUrl = normalizeWordPressSiteUrl(siteInput);
	const origin = new URL(siteUrl);
	const baseApiUrl = new URL("/wp-json/wp/v2/", origin).toString();

	const items = await Promise.all([
		getCollectionCount(baseApiUrl, "users", "Users"),
		getTypesCount(baseApiUrl),
		getCollectionCount(baseApiUrl, "media", "Media"),
		getCollectionCount(baseApiUrl, "pages", "Pages"),
		getCollectionCount(baseApiUrl, "posts", "Posts"),
	]);

	return {
		siteUrl,
		baseApiUrl,
		items,
	};
}

async function getCollectionCount(
	baseApiUrl: string,
	resource: string,
	label: string,
): Promise<WordPressCollectionSummary> {
	const endpoint = new URL(resource, baseApiUrl);
	const probeUrl = new URL(endpoint);
	probeUrl.searchParams.set("per_page", "1");
	probeUrl.searchParams.set("_fields", "id");

	try {
		const response = await fetch(probeUrl, {
			headers: {
				Accept: "application/json",
				"User-Agent": USER_AGENT,
			},
		});

		if (!response.ok) {
			return {
				label,
				count: null,
				error: await summarizeWordPressError(response),
			};
		}

		const totalHeader = response.headers.get("X-WP-Total");
		if (totalHeader && Number.isFinite(Number(totalHeader))) {
			return {
				label,
				count: Number(totalHeader),
				error: null,
			};
		}

		const body = await response.json();
		const count = Array.isArray(body) ? body.length : null;
		return {
			label,
			count,
			error: count === null ? "The endpoint did not return a total count." : null,
		};
	} catch (error) {
		return {
			label,
			count: null,
			error: error instanceof Error ? error.message : "Request failed.",
		};
	}
}

async function getTypesCount(baseApiUrl: string): Promise<WordPressCollectionSummary> {
	const endpoint = new URL("types", baseApiUrl);

	try {
		const response = await fetch(endpoint, {
			headers: {
				Accept: "application/json",
				"User-Agent": USER_AGENT,
			},
		});

		if (!response.ok) {
			return {
				label: "Types",
				count: null,
				error: await summarizeWordPressError(response),
			};
		}

		const body = await response.json();
		const count = body && typeof body === "object" && !Array.isArray(body) ? Object.keys(body).length : null;
		return {
			label: "Types",
			count,
			error: count === null ? "The endpoint returned an unexpected payload." : null,
		};
	} catch (error) {
		return {
			label: "Types",
			count: null,
			error: error instanceof Error ? error.message : "Request failed.",
		};
	}
}

async function summarizeWordPressError(response: Response): Promise<string> {
	try {
		const body = await response.json();
		if (body && typeof body === "object" && "message" in body && typeof body.message === "string" && body.message.trim()) {
			return body.message;
		}
	} catch {
		// Ignore non-JSON bodies and fall back to the HTTP status text.
	}

	return `${response.status} ${response.statusText}`.trim();
}
