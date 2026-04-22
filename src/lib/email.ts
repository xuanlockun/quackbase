import type { SmtpSettings } from "./blog";

export interface EmailMessage {
	to: string[];
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
}

export interface CloudflareEmailBinding {
	send(message: {
		to: string | string[];
		from: string | { email: string; name?: string };
		subject: string;
		text?: string;
		html?: string;
		replyTo?: string | { email: string; name?: string };
		headers?: Record<string, string>;
	}): Promise<{ messageId: string }>;
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
	settings: SmtpSettings,
	message: EmailMessage,
	emailBinding?: CloudflareEmailBinding | null,
): Promise<void> {
	const smtp = validateSmtpSettings(settings);
	const binding = emailBinding ?? null;
	if (!binding) {
		throw new Error("Cloudflare Email Service binding EMAIL is not configured.");
	}

	const recipients = message.to.map(validateEmailAddress);
	if (recipients.length === 0) {
		throw new Error("At least one email recipient is required.");
	}

	const payload = {
		to: recipients.length === 1 ? recipients[0] : recipients,
		from: {
			email: smtp.fromEmail,
			name: smtp.fromName,
		},
		subject: message.subject,
		text: message.text,
		...(message.html ? { html: message.html } : {}),
		...(message.replyTo
			? {
					replyTo: validateEmailAddress(message.replyTo),
				}
			: {}),
	};

	await binding.send(payload);
}

function normalizePort(value: number): number {
	return Number.isFinite(value) && value >= 1 && value <= 65535 ? Math.floor(value) : 587;
}
