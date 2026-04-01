const SESSION_COOKIE_NAME = "cms_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getAdminSessionCookieName(): string {
	return SESSION_COOKIE_NAME;
}

export function readAdminSessionCookie(request: Request): string | null {
	const cookieHeader = request.headers.get("cookie") ?? "";
	const target = `${SESSION_COOKIE_NAME}=`;

	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim();
		if (trimmed.startsWith(target)) {
			return decodeURIComponent(trimmed.slice(target.length));
		}
	}

	return null;
}

export function createAdminSessionCookie(token: string, requestUrl: string): string {
	const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
	return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function clearAdminSessionCookie(requestUrl: string): string {
	const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
	return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
