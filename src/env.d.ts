import type { LanguageCatalogState } from "./lib/languages";
import type { LocalizationPayload } from "./lib/localization";

interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	CLOUDFLARE_ACCOUNT_ID?: string;
	CLOUDFLARE_API_TOKEN?: string;
	D1_DATABASE_ID?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
type AdminSession = import("./lib/auth/types").AdminSession;

declare namespace App {
	interface Locals extends Runtime {
		adminSession: AdminSession | null;
		uiLanguage: string;
		languageCatalog: LanguageCatalogState;
		localizationPayload?: LocalizationPayload;
	}
}
