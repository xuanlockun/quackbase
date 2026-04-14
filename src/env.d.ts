import type { LanguageCatalogState } from "./lib/languages";
import type { LocalizationPayload } from "./lib/localization";

interface Env {
	DB: D1Database;
	JWT_SECRET: string;
	SECRETS_ENCRYPTION_KEY?: string;
	R2_BUCKET?: R2Bucket;
	R2_PUBLIC_BASE_URL?: string;
	MEDIA_PUBLIC_BASE_URL?: string;
	S3_ENDPOINT?: string;
	S3_BUCKET?: string;
	S3_ACCESS_KEY_ID?: string;
	S3_SECRET_ACCESS_KEY?: string;
	S3_REGION?: string;
	S3_FORCE_PATH_STYLE?: string;
	S3_PUBLIC_BASE_URL?: string;
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
