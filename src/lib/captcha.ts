export interface CaptchaSettings {
	enabled: boolean;
	siteKey: string;
	secretKey: string;
}

export function normalizeCaptchaSettings(input: {
	captchaEnabled?: boolean;
	captchaSiteKey?: string;
	captchaSecretKey?: string;
}): CaptchaSettings {
	return {
		enabled: Boolean(input.captchaEnabled),
		siteKey: (input.captchaSiteKey ?? "").trim(),
		secretKey: (input.captchaSecretKey ?? "").trim(),
	};
}

export function hasCaptchaConfiguration(settings: CaptchaSettings): boolean {
	return settings.enabled && Boolean(settings.siteKey) && Boolean(settings.secretKey);
}

export async function verifyCaptchaToken(
	settings: CaptchaSettings,
	token: string,
	options?: { remoteIp?: string },
): Promise<void> {
	if (!hasCaptchaConfiguration(settings)) {
		throw new Error("Captcha is not configured.");
	}

	const normalizedToken = token.trim();
	if (!normalizedToken) {
		throw new Error("Captcha verification failed.");
	}

	const body = new URLSearchParams({
		secret: settings.secretKey,
		response: normalizedToken,
	});
	if (options?.remoteIp?.trim()) {
		body.set("remoteip", options.remoteIp.trim());
	}

	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

	const payload = (await response.json().catch(() => null)) as { success?: boolean; "error-codes"?: string[] } | null;
	if (!response.ok || !payload?.success) {
		throw new Error("Captcha verification failed.");
	}
}
