import type { APIRoute } from "astro";
import { getDb, getSmtpSettings, parseSmtpSettingsForm, saveSmtpSettings } from "../../../lib/blog";
import { requireApiPermission } from "../../../lib/rbac/guards";
import { sendSmtpEmail, validateSmtpSettings } from "../../../lib/email";
import { upsertAdminSecret } from "../../../lib/secrets";

export const prerender = false;

export const POST: APIRoute = async ({ locals, request, redirect }) => {
	const session = await requireApiPermission(
		{ locals, request, redirect },
		["site.manage"],
		{ loginRedirect: "/admin/login", forbiddenRedirect: "/admin/settings" },
	);
	if (session instanceof Response) {
		return session;
	}

	const formData = await request.formData();
	const intent = String(formData.get("intent") ?? "save").trim();

	try {
		const db = getDb(locals);
		const resendApiKey = String(formData.get("resendApiKey") ?? "").trim();
		const currentSettings = await getSmtpSettings(db);
		const formSettings = parseSmtpSettingsForm(formData);
		const settings = validateSmtpSettings({
			...currentSettings,
			...formSettings,
			username: formSettings.username || currentSettings.username,
			password: formSettings.password || currentSettings.password,
		});
		if (intent === "test") {
			console.log("[email-test] starting", {
				fromEmail: settings.fromEmail,
				fromName: settings.fromName,
			});
			await sendSmtpEmail(
				db,
				locals.runtime.env,
				settings,
				{
					to: [settings.fromEmail],
					subject: "Email test from Edge CMS",
					text: "This is a test email sent from the Edge CMS admin settings page.",
					html: "<p>This is a test email sent from the Edge CMS admin settings page.</p>",
				},
				{ resendApiKey: resendApiKey || null },
			);
			console.log("[email-test] completed successfully");
			return Response.json({ ok: true, message: "Test email sent successfully." });
		}

		if (resendApiKey) {
			await upsertAdminSecret(
				db,
				{
					secretType: "resend_api_key",
					label: "Resend API Key",
					secretValue: resendApiKey,
				},
				locals.runtime.env,
			);
		}

		await saveSmtpSettings(db, settings);
		return redirect("/admin/settings?smtpSaved=1");
	} catch (error) {
		const message = error instanceof Error ? error.message : "Email settings could not be saved.";
		if (request.headers.get("x-requested-with") === "fetch" || request.headers.get("accept")?.includes("application/json")) {
			return Response.json({ ok: false, error: message }, { status: 400 });
		}
		return redirect(`/admin/settings?smtpError=${encodeURIComponent(message)}`);
	}
};
