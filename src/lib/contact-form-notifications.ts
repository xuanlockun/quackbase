import type { ContactFormSubmissionContext } from "./contact-form-hooks";
import { registerContactFormSubmissionHook } from "./contact-form-hooks";
import { sendSmtpEmail, parseEmailList } from "./email";

registerContactFormSubmissionHook(async (context) => {
	await sendContactFormNotificationEmail(context);
});

export async function sendContactFormNotificationEmail(context: ContactFormSubmissionContext): Promise<void> {
	const recipients = parseEmailList(context.contactForm.notificationEmails.join(", "));
	if (recipients.length === 0) {
		console.log("[contact-notify] skipped", {
			formId: context.contactForm.id,
			formTitle: context.contactForm.title,
			reason: "no recipients configured",
		});
		return;
	}

	const smtpSettings = context.siteConfig.smtpSettings;
	if (!smtpSettings.fromEmail.trim() || !smtpSettings.fromName.trim()) {
		console.log("[contact-notify] skipped", {
			formId: context.contactForm.id,
			formTitle: context.contactForm.title,
			reason: "sender not configured",
		});
		return;
	}

	const submittedAt = context.submission.submittedAt.toISOString();
	const fieldRows = context.contactForm.fields
		.map((field) => {
			const key = String(field.id);
			const value = context.submission.values[key] ?? "";
			if (!value) {
				return "";
			}
			const label = Object.values(field.label).find((entry) => typeof entry === "string" && entry.trim()) ?? `Field ${key}`;
			return `<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;">${escapeHtml(label)}</th><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`;
		})
		.filter(Boolean)
		.join("");
	const metadataRows = [
		context.requestInfo.ipAddress ? [`IP`, context.requestInfo.ipAddress] : null,
		context.requestInfo.userAgent ? [`User agent`, context.requestInfo.userAgent] : null,
		context.requestInfo.referer ? [`Referrer`, context.requestInfo.referer] : null,
	]
		.filter((entry): entry is [string, string] => Boolean(entry))
		.map(([label, value]) => `<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;">${escapeHtml(label)}</th><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`)
		.join("");

	const textLines = [
		`Contact form submission: ${context.contactForm.title}`,
		`Submitted at: ${submittedAt}`,
		"",
		"Fields:",
		...context.contactForm.fields
			.map((field) => {
				const key = String(field.id);
				const value = context.submission.values[key] ?? "";
				if (!value) {
					return "";
				}
				const label = Object.values(field.label).find((entry) => typeof entry === "string" && entry.trim()) ?? `Field ${key}`;
				return `- ${label}: ${value}`;
			})
			.filter(Boolean),
	];

	if (metadataRows) {
		textLines.push("", "Metadata:");
		if (context.requestInfo.ipAddress) textLines.push(`- IP: ${context.requestInfo.ipAddress}`);
		if (context.requestInfo.userAgent) textLines.push(`- User agent: ${context.requestInfo.userAgent}`);
		if (context.requestInfo.referer) textLines.push(`- Referrer: ${context.requestInfo.referer}`);
	}

	console.log("[contact-notify] sending", {
		formId: context.contactForm.id,
		formTitle: context.contactForm.title,
		recipients,
		fromEmail: smtpSettings.fromEmail,
		fromName: smtpSettings.fromName,
		fieldCount: context.contactForm.fields.length,
	});

	await sendSmtpEmail(
		context.db,
		context.runtimeEnv,
		smtpSettings,
		{
			to: recipients,
			subject: `New contact form submission: ${context.contactForm.title}`,
			text: textLines.join("\n"),
			html: `
				<div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827;">
					<h2 style="margin: 0 0 12px;">${escapeHtml(context.contactForm.title)}</h2>
					<p style="margin: 0 0 16px; color: #4b5563;">Submitted at ${escapeHtml(submittedAt)}</p>
					<table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 720px;">
						${fieldRows || "<tr><td>No field values were captured.</td></tr>"}
					</table>
					${metadataRows ? `<h3 style="margin: 24px 0 8px;">Metadata</h3><table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 720px;">${metadataRows}</table>` : ""}
				</div>
			`,
		},
	);

	console.log("[contact-notify] sent", {
		formId: context.contactForm.id,
		formTitle: context.contactForm.title,
		recipients,
	});
}

function escapeHtml(value: string): string {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
