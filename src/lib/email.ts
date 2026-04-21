import { connect } from "cloudflare:sockets";
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

export function normalizeSmtpSettings(input: SmtpSettings): SmtpSettings {
	return {
		host: input.host.trim(),
		port: normalizePort(input.port),
		username: input.username.trim(),
		password: input.password,
		encryption: input.encryption === "ssl" ? "ssl" : "tls",
		fromEmail: validateEmailAddress(input.fromEmail),
		fromName: input.fromName.trim(),
	};
}

export function validateSmtpSettings(input: SmtpSettings): SmtpSettings {
	const normalized = normalizeSmtpSettings(input);
	if (!normalized.host) {
		throw new Error("SMTP host is required.");
	}
	if (!normalized.fromName) {
		throw new Error("SMTP from name is required.");
	}
	if (!normalized.port || normalized.port < 1 || normalized.port > 65535) {
		throw new Error("SMTP port must be between 1 and 65535.");
	}
	if ((normalized.username && !normalized.password) || (!normalized.username && normalized.password)) {
		throw new Error("SMTP username and password must both be provided.");
	}
	return normalized;
}

export async function sendSmtpEmail(settings: SmtpSettings, message: EmailMessage, debug = false): Promise<void> {
	const smtp = validateSmtpSettings(settings);
	const recipients = message.to.map(validateEmailAddress);
	if (recipients.length === 0) {
		throw new Error("At least one email recipient is required.");
	}

	const transport = smtp.encryption === "ssl" ? "on" : "starttls";
	if (debug) {
		console.log("[smtp] starting send", {
			host: smtp.host,
			port: smtp.port,
			encryption: smtp.encryption,
			recipientCount: recipients.length,
			subject: message.subject,
		});
	}
	let socket = await connectToSmtp(smtp, transport);
	try {
		await socket.opened;
		if (debug) {
			console.log("[smtp] socket opened");
		}
		const reader = socket.readable.pipeThrough(new TextDecoderStream()).getReader();
		const writer = socket.writable.getWriter();

		await expectReply(await readReply(reader), [220], "SMTP greeting");
		await sendCommand(writer, `EHLO ${getClientHostname(smtp.host)}`);
		let reply = await readReply(reader);
		await expectReply(reply, [250], "SMTP EHLO");
		if (debug) {
			console.log("[smtp] ehlo response", reply.lines);
		}

		if (smtp.encryption === "tls") {
			if (!reply.lines.some((line) => /STARTTLS/i.test(line))) {
				throw new Error("SMTP server does not support STARTTLS.");
			}

			if (debug) {
				console.log("[smtp] upgrading to starttls");
			}
			await sendCommand(writer, "STARTTLS");
			await expectReply(await readReply(reader), [220], "SMTP STARTTLS");
			await writer.close().catch(() => undefined);
			try {
				socket = socket.startTls();
			} catch (error) {
				if (debug) {
					console.error("[smtp] startTls failed", error);
				}
				throw error;
			}
			if (debug) {
				console.log("[smtp] tls upgrade complete");
			}
			await socket.opened;
			if (debug) {
				console.log("[smtp] upgraded socket opened");
			}
			await sendSmtpEmailOverSocket(socket, smtp, recipients, message, debug);
			return;
		}

		await authenticateIfNeeded(reader, writer, smtp);
		await sendEnvelope(reader, writer, smtp, recipients, message);
		await writer.close().catch(() => undefined);
		await socket.close().catch(() => undefined);
	} catch (error) {
		await socket.close().catch(() => undefined);
		throw error;
	}
}

async function sendSmtpEmailOverSocket(
	socket: ReturnType<typeof connect>,
	settings: SmtpSettings,
	recipients: string[],
	message: EmailMessage,
	debug = false,
): Promise<void> {
	await socket.opened;
	const reader = socket.readable.pipeThrough(new TextDecoderStream()).getReader();
	const writer = socket.writable.getWriter();
	await sendCommand(writer, `EHLO ${getClientHostname(settings.host)}`);
	await expectReply(await readReply(reader), [250], "SMTP EHLO");
	if (debug) {
		console.log("[smtp] post-tls ehlo complete");
	}
	await authenticateIfNeeded(reader, writer, settings);
	if (debug && settings.username) {
		console.log("[smtp] authentication completed");
	}
	await sendEnvelope(reader, writer, settings, recipients, message);
	await writer.close().catch(() => undefined);
	await socket.close().catch(() => undefined);
}

async function connectToSmtp(settings: SmtpSettings, transport: "off" | "on" | "starttls") {
	return connect({
		hostname: settings.host,
		port: settings.port,
		secureTransport: transport,
		allowHalfOpen: false,
	});
}

async function authenticateIfNeeded(
	reader: ReadableStreamDefaultReader<string>,
	writer: WritableStreamDefaultWriter<Uint8Array>,
	settings: SmtpSettings,
): Promise<void> {
	if (!settings.username) {
		return;
	}

	const plainToken = base64Utf8(`\0${settings.username}\0${settings.password}`);
	await sendCommand(writer, `AUTH PLAIN ${plainToken}`);
	let reply = await readReply(reader);
	if (reply.code === 235) {
		return;
	}

	await sendCommand(writer, "AUTH LOGIN");
	reply = await readReply(reader);
	await expectReply(reply, [334], "SMTP AUTH LOGIN");

	await sendCommand(writer, base64Utf8(settings.username));
	reply = await readReply(reader);
	await expectReply(reply, [334], "SMTP AUTH username");

	await sendCommand(writer, base64Utf8(settings.password));
	reply = await readReply(reader);
	await expectReply(reply, [235], "SMTP AUTH password");
}

async function sendEnvelope(
	reader: ReadableStreamDefaultReader<string>,
	writer: WritableStreamDefaultWriter<Uint8Array>,
	settings: SmtpSettings,
	recipients: string[],
	message: EmailMessage,
): Promise<void> {
	await sendCommand(writer, `MAIL FROM:<${settings.fromEmail}>`);
	await expectReply(await readReply(reader), [250], "SMTP MAIL FROM");

	for (const recipient of recipients) {
		await sendCommand(writer, `RCPT TO:<${recipient}>`);
		await expectReply(await readReply(reader), [250, 251], "SMTP RCPT TO");
	}

	await sendCommand(writer, "DATA");
	await expectReply(await readReply(reader), [354], "SMTP DATA");

	const payload = buildMimeMessage(settings, recipients, message);
	await writer.write(encodeUtf8(dotStuff(payload) + "\r\n.\r\n"));
	await expectReply(await readReply(reader), [250], "SMTP message");

	await sendCommand(writer, "QUIT");
	await readReply(reader).catch(() => undefined);
}

function buildMimeMessage(settings: SmtpSettings, recipients: string[], message: EmailMessage): string {
	const boundary = `edgecms-${crypto.randomUUID().replace(/-/g, "")}`;
	const headers = [
		`From: ${formatAddress(settings.fromName, settings.fromEmail)}`,
		`To: ${recipients.join(", ")}`,
		`Subject: ${encodeHeaderValue(message.subject)}`,
		`Date: ${new Date().toUTCString()}`,
		`Message-ID: <${crypto.randomUUID()}@${settings.host.replace(/^.*@/, "")}>`,
		"MIME-Version: 1.0",
		`Content-Type: multipart/alternative; boundary="${boundary}"`,
	];

	const body: string[] = [
		`--${boundary}`,
		"Content-Type: text/plain; charset=utf-8",
		"Content-Transfer-Encoding: 8bit",
		"",
		message.text,
	];

	if (message.html) {
		body.push(
			"",
			`--${boundary}`,
			"Content-Type: text/html; charset=utf-8",
			"Content-Transfer-Encoding: 8bit",
			"",
			message.html,
		);
	}

	body.push(`--${boundary}--`, "");
	return [...headers, "", ...body].join("\r\n");
}

async function readReply(reader: ReadableStreamDefaultReader<string>): Promise<{ code: number; message: string; lines: string[] }> {
	const lines: string[] = [];
	let buffered = "";

	while (true) {
		const lineResult = await readLine(reader, buffered);
		buffered = lineResult.buffered;
		const line = lineResult.line;
		const match = line.match(/^(\d{3})([ -])(.*)$/);
		if (!match) {
			continue;
		}

		const code = Number.parseInt(match[1], 10);
		lines.push(match[3]);
		if (match[2] === " ") {
			return { code, message: lines.join("\n"), lines };
		}
	}
}

async function readLine(
	reader: ReadableStreamDefaultReader<string>,
	buffered: string,
): Promise<{ line: string; buffered: string }> {
	while (true) {
		const newlineIndex = buffered.indexOf("\n");
		if (newlineIndex >= 0) {
			const line = buffered.slice(0, newlineIndex).replace(/\r$/, "");
			return { line, buffered: buffered.slice(newlineIndex + 1) };
		}

		const { value, done } = await reader.read();
		if (done) {
			throw new Error("SMTP connection closed unexpectedly.");
		}

		buffered += value ?? "";
	}
}

async function expectReply(
	reply: { code: number; message: string },
	allowedCodes: number[],
	context: string,
): Promise<void> {
	if (!allowedCodes.includes(reply.code)) {
		throw new Error(`${context} failed: ${reply.message || `SMTP returned ${reply.code}`}`);
	}
}

async function sendCommand(writer: WritableStreamDefaultWriter<Uint8Array>, command: string): Promise<void> {
	await writer.write(encodeUtf8(`${command}\r\n`));
}

function formatAddress(name: string, email: string): string {
	const normalizedName = name.trim();
	const normalizedEmail = validateEmailAddress(email);
	return normalizedName ? `${encodeHeaderValue(normalizedName)} <${normalizedEmail}>` : `<${normalizedEmail}>`;
}

function encodeHeaderValue(value: string): string {
	if (/^[\x20-\x7e]*$/.test(value)) {
		return value.replace(/["\\]/g, "\\$&");
	}

	return `=?UTF-8?B?${base64Utf8(value)}?=`;
}

function base64Utf8(value: string): string {
	const bytes = encodeUtf8(value);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function encodeUtf8(value: string): Uint8Array {
	return new TextEncoder().encode(value);
}

function dotStuff(value: string): string {
	return value.replace(/^\./gm, "..");
}

function getClientHostname(host: string): string {
	const cleaned = host.trim().replace(/[^a-z0-9.-]/gi, "-");
	return cleaned || "edgecms.local";
}

function normalizePort(value: number): number {
	return Number.isFinite(value) && value >= 1 && value <= 65535 ? Math.floor(value) : 587;
}
