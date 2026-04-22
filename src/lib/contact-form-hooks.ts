import type { ContactFormRecord } from "./contact-forms";
import type { ContactFormSubmissionRecord } from "./forms";
import type { CloudflareEmailBinding } from "./email";
import type { SiteConfig } from "./blog";

export interface ContactFormSubmissionRequestInfo {
	ipAddress?: string;
	userAgent?: string;
	referer?: string;
}

export interface ContactFormSubmissionContext {
	db: D1Database;
	siteConfig: SiteConfig;
	contactForm: ContactFormRecord;
	submission: ContactFormSubmissionRecord;
	requestInfo: ContactFormSubmissionRequestInfo;
	emailService?: CloudflareEmailBinding | null;
}

export type ContactFormSubmissionHook = (context: ContactFormSubmissionContext) => void | Promise<void>;

const submissionHooks: ContactFormSubmissionHook[] = [];

export function registerContactFormSubmissionHook(hook: ContactFormSubmissionHook): void {
	if (!submissionHooks.includes(hook)) {
		submissionHooks.push(hook);
	}
}

export async function emitContactFormSubmissionHooks(context: ContactFormSubmissionContext): Promise<void> {
	for (const hook of submissionHooks) {
		try {
			await hook(context);
		} catch (error) {
			console.error("Contact form submission hook failed.", error);
		}
	}
}
