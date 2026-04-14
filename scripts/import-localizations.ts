#!/usr/bin/env node

import { spawnSync } from "child_process";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

type FlattenedTranslations = Record<string, string>;

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const LOCALES_DIR = resolve(ROOT, "locales");
const WRANGLER_PATH = resolve(ROOT, "wrangler.json");
const DESCRIPTION_PATTERN = /description$/i;
const LOCALE_ORDER = new Map([
	["en", 0],
	["vi", 1],
	["jp", 2],
]);

function listLocaleFiles(): Array<{ code: string; path: string }> {
	return readdirSync(LOCALES_DIR)
		.filter((file) => file.endsWith(".json"))
		.map((file) => ({
			code: file.replace(/\.json$/, "").toLowerCase(),
			path: resolve(LOCALES_DIR, file),
		}));
}

function flattenTranslations(value: unknown, prefix = ""): FlattenedTranslations {
	const entries: FlattenedTranslations = {};

	if (typeof value === "string") {
		if (value.trim()) {
			entries[prefix] = value.trim();
		}
		return entries;
	}

	if (typeof value === "object" && value !== null) {
		for (const [key, child] of Object.entries(value)) {
			const nextKey = prefix ? `${prefix}.${key}` : key;
			Object.assign(entries, flattenTranslations(child, nextKey));
		}
	}

	return entries;
}

function buildInsertStatements(): string[] {
	const statements: string[] = [];
	for (const locale of listLocaleFiles().sort((left, right) => (LOCALE_ORDER.get(left.code) ?? 999) - (LOCALE_ORDER.get(right.code) ?? 999))) {
		const raw = JSON.parse(readFileSync(locale.path, "utf-8"));
		const flattened = flattenTranslations(raw);
		for (const [translationKey, translatedValue] of Object.entries(flattened)) {
			if (!translatedValue.trim() || DESCRIPTION_PATTERN.test(translationKey)) {
				continue;
			}

			const sanitizedValue = translatedValue.replace(/'/g, "''");
			statements.push(
				`INSERT INTO translation_entries (locale_code, translation_key, translated_value) VALUES ('${locale.code}', '${translationKey}', '${sanitizedValue}') ON CONFLICT(locale_code, translation_key) DO UPDATE SET translated_value = excluded.translated_value, updated_at = excluded.updated_at;`,
			);
		}
	}
	return statements;
}

function readDatabaseName(): string {
	const raw = JSON.parse(readFileSync(WRANGLER_PATH, "utf-8"));
	const entry = (raw.d1_databases as Array<{ database_name?: string }> | undefined)?.[0];
	if (!entry?.database_name) {
		throw new Error("Missing d1 database entry in wrangler.json.");
	}
	return entry.database_name;
}

function runWrangler(target: "local" | "remote", sql: string): void {
	const databaseName = readDatabaseName();
	const executable = process.platform === "win32" ? "npx.cmd" : "npx";
	const args = ["d1", "execute", databaseName, `--${target}`, "--file", "-"];
	const result = spawnSync(executable, args, {
		input: Buffer.from(sql, "utf-8"),
		stdio: "inherit",
		cwd: ROOT,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(`wrangler d1 execute failed (${target})`);
	}
}

function printUsage(): void {
	console.log("Usage: node scripts/import-localizations.ts [--apply=local|remote] [--dry-run]");
	console.log("  --apply=local    Pipe SQL directly into `npx wrangler d1 execute <db> --local --file -`.");
	console.log("  --apply=remote   Push the SQL to the remote D1 database.");
	console.log("  --dry-run        Print SQL without mutating the database (default).");
}

function main(): void {
	const args = process.argv.slice(2);
	const applyArg = args.find((arg) => arg.startsWith("--apply="));
	const dryRun = args.includes("--dry-run") || !applyArg;
	let applyTarget: "local" | "remote" | null = null;

	if (applyArg) {
		const [, value] = applyArg.split("=", 2);
		if (value === "local" || value === "remote") {
			applyTarget = value;
		} else {
			console.error(`Unknown apply target "${value}".`);
			printUsage();
			process.exit(1);
		}
	}

	const statements = buildInsertStatements();
	if (statements.length === 0) {
		console.log("No translation entries found.");
		return;
	}

	const sql = ["BEGIN;", ...statements, "COMMIT;"].join("\n");

	if (dryRun) {
		console.log(sql);
		return;
	}

	if (applyTarget) {
		runWrangler(applyTarget, sql);
		return;
	}

	printUsage();
}

main();
