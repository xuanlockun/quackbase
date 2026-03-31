interface Env {
	DB: D1Database;
	CMS_ADMIN_TOKEN?: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}
