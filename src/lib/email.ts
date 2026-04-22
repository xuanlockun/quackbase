import { getAdminSecretValueByType } from "./secrets";
import type { SmtpSettings } from "./blog";

export interface EmailMessage {
	to: string[];
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
}

export function parseEmailList(value: string): string[] {
	if (!value.trim()) {
		return [];
	}

	return [...new Set(value.split(/[,;\n]/).map((entry) => normalizeEmailAddress(entry)).filter(Boolean))];
}

export function normalizeEmailAddress(value: string): string {
	return value.trim().toLowerCase();
}

export function validateEmailAddress(value: string): string {
	const email = normalizeEmailAddress(value);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error(`Invalid email address: ${value}`);
	}

	return email;
}

export function validateSmtpSettings(input: SmtpSettings): SmtpSettings {
	const fromEmail = validateEmailAddress(input.fromEmail);
	const fromName = input.fromName.trim();
	if (!fromName) {
		throw new Error("Email sender name is required.");
	}

	return {
		...input,
		host: input.host.trim(),
		port: normalizePort(input.port),
		username: input.username.trim(),
		password: input.password,
		encryption: input.encryption === "ssl" ? "ssl" : "tls",
		fromEmail,
		fromName,
	};
}

export async function sendSmtpEmail(
	db: D1Database,
	env: { JWT_SECRET?: string; SECRETS_ENCRYPTION_KEY?: string },
	settings: SmtpSettings,
	message: EmailMessage,
	options?: { resendApiKey?: string | null; debug?: boolean },
): Promise<void> {
	const smtp = validateSmtpSettings(settings);
	const recipients = message.to.map(validateEmailAddress);
	if (recipients.length === 0) {
		throw new Error("At least one email recipient is required.");
	}

	const apiKey = await resolveResendApiKey(db, env, options?.resendApiKey ?? null);
	if (!apiKey) {
		throw new Error("Resend API key is not configured.");
	}

	const payload = {
		from: formatFromAddress(smtp.fromName, smtp.fromEmail),
		to: recipients.length === 1 ? recipients[0] : recipients,
		subject: message.subject,
		text: message.text,
		...(message.html ? { html: message.html } : {}),
	};

	console.log("[resend] sending", {
		from: payload.from,
		to: payload.to,
		subject: payload.subject,
		html: Boolean(message.html),
	});

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"User-Agent": "Edge CMS",
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json().catch(() => null) as
		| { id?: string; message?: string; name?: string }
		| null;

	if (!response.ok) {
		const messageText = data?.message || data?.name || `Resend returned HTTP ${response.status}`;
		console.error("[resend] send failed", {
			status: response.status,
			message: messageText,
			details: data,
		});
		throw new Error(messageText);
	}

	console.log("[resend] send complete", {
		id: data?.id,
		to: payload.to,
		subject: payload.subject,
	});
}

async function resolveResendApiKey(
	db: D1Database,
	env: { JWT_SECRET?: string; SECRETS_ENCRYPTION_KEY?: string },
	overrideKey?: string | null,
): Promise<string> {
	const explicitKey = typeof overrideKey === "string" ? overrideKey.trim() : "";
	if (explicitKey) {
		return explicitKey;
	}

	const storedKey = await getAdminSecretValueByType(db, "resend_api_key", env);

	return storedKey?.trim() ?? "";
}

function formatFromAddress(name: string, email: string): string {
	const normalizedName = name.trim();
	const normalizedEmail = validateEmailAddress(email);
	return normalizedName ? `${escapeHeaderValue(normalizedName)} <${normalizedEmail}>` : `<${normalizedEmail}>`;
}

function escapeHeaderValue(value: string): string {
	return value.replace(/["\\]/g, "\\$&");
}

function normalizePort(value: number): number {
	return Number.isFinite(value) && value >= 1 && value <= 65535 ? Math.floor(value) : 587;
}
