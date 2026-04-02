interface Env {
	DB: D1Database;
	JWT_SECRET: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
type AdminSession = import("./lib/auth/types").AdminSession;

declare namespace App {
	interface Locals extends Runtime {
		adminSession: AdminSession | null;
		uiLanguage: string;
	}
}
