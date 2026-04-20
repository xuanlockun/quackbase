import type {
	AdminAuthUser,
	AdminUserSummary,
	CreateAdminUserInput,
	RoleSummary,
	UpdateAdminUserInput,
} from "../auth/types";
import { replaceUserRoles } from "./roles";

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function countAdminUsers(db: D1Database): Promise<number> {
	const row = await db.prepare(`SELECT COUNT(*) as count FROM users`).first<{ count: number }>();
	return row?.count ?? 0;
}

export async function findAdminUserByEmail(db: D1Database, email: string): Promise<AdminAuthUser | null> {
	const user = await db
		.prepare(
			`SELECT id, email, password_hash as passwordHash, display_name as displayName, is_active as isActive, last_login_at as lastLoginAt
			FROM users
			WHERE email = ?1
			LIMIT 1`,
		)
		.bind(normalizeEmail(email))
		.first<{ id: number; email: string; passwordHash: string; displayName: string; isActive: number; lastLoginAt: string | null }>();

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		passwordHash: user.passwordHash,
		displayName: user.displayName,
		isActive: user.isActive === 1,
		lastLoginAt: user.lastLoginAt,
	};
}

export async function findAdminUserById(db: D1Database, userId: number): Promise<AdminAuthUser | null> {
	const user = await db
		.prepare(
			`SELECT id, email, password_hash as passwordHash, display_name as displayName, is_active as isActive, last_login_at as lastLoginAt
			FROM users
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(userId)
		.first<{ id: number; email: string; passwordHash: string; displayName: string; isActive: number; lastLoginAt: string | null }>();

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		passwordHash: user.passwordHash,
		displayName: user.displayName,
		isActive: user.isActive === 1,
		lastLoginAt: user.lastLoginAt,
	};
}

export async function updateLastLoginAt(db: D1Database, userId: number): Promise<void> {
	await db
		.prepare(
			`UPDATE users
			SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?1`,
		)
		.bind(userId)
		.run();
}

export async function listAdminUsers(db: D1Database): Promise<AdminUserSummary[]> {
	const usersResult = await db
		.prepare(
			`SELECT id, email, display_name as displayName, is_active as isActive
			FROM users
			ORDER BY email ASC, id ASC`,
		)
		.all<{ id: number; email: string; displayName: string; isActive: number }>();

	const rolesResult = await db
		.prepare(
			`SELECT ur.user_id as userId, r.id, r.name, r.label
			FROM user_roles ur
			INNER JOIN roles r ON r.id = ur.role_id
			ORDER BY ur.user_id ASC, r.label ASC, r.id ASC`,
		)
		.all<{ userId: number; id: number; name: string; label: string }>();

	const roleMap = new Map<number, RoleSummary[]>();
	for (const row of rolesResult.results ?? []) {
		const existing = roleMap.get(row.userId) ?? [];
		existing.push({ id: row.id, name: row.name, label: row.label });
		roleMap.set(row.userId, existing);
	}

	return (usersResult.results ?? []).map((user) => ({
		id: user.id,
		email: user.email,
		displayName: user.displayName,
		isActive: user.isActive === 1,
		roles: roleMap.get(user.id) ?? [],
	}));
}

export async function getAdminUserSummaryById(db: D1Database, userId: number): Promise<AdminUserSummary | null> {
	const user = await db
		.prepare(
			`SELECT id, email, display_name as displayName, is_active as isActive
			FROM users
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(userId)
		.first<{ id: number; email: string; displayName: string; isActive: number }>();

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		displayName: user.displayName,
		isActive: user.isActive === 1,
		roles: await getRoleSummariesForUser(db, user.id),
	};
}

export async function createAdminUser(
	db: D1Database,
	input: CreateAdminUserInput,
	assignedByUserId?: number,
): Promise<AdminUserSummary> {
	const email = normalizeEmail(input.email);
	const displayName = input.displayName.trim();

	await db
		.prepare(
			`INSERT INTO users (email, password_hash, display_name, is_active, created_at, updated_at)
			VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		)
		.bind(email, input.passwordHash, displayName, input.isActive ? 1 : 0)
		.run();

	const createdUser = await db
		.prepare(
			`SELECT id, email, display_name as displayName, is_active as isActive
			FROM users
			WHERE email = ?1
			LIMIT 1`,
		)
		.bind(email)
		.first<{ id: number; email: string; displayName: string; isActive: number }>();

	if (!createdUser) {
		throw new Error("User could not be created.");
	}

	await replaceUserRoles(db, createdUser.id, input.roleIds, assignedByUserId);

	return {
		id: createdUser.id,
		email: createdUser.email,
		displayName: createdUser.displayName,
		isActive: createdUser.isActive === 1,
		roles: await getRoleSummariesForUser(db, createdUser.id),
	};
}

export async function updateAdminUser(
	db: D1Database,
	userId: number,
	input: UpdateAdminUserInput,
	assignedByUserId?: number,
): Promise<AdminUserSummary | null> {
	const existingUser = await db
		.prepare(
			`SELECT id, email, display_name as displayName, is_active as isActive
			FROM users
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(userId)
		.first<{ id: number; email: string; displayName: string; isActive: number }>();

	if (!existingUser) {
		return null;
	}

	const nextDisplayName = input.displayName?.trim() ? input.displayName.trim() : existingUser.displayName;
	const nextIsActive = input.isActive ?? (existingUser.isActive === 1);
	const nextPasswordHash = input.passwordHash ?? null;

	if (nextPasswordHash) {
		await db
			.prepare(
				`UPDATE users
				SET display_name = ?1, is_active = ?2, password_hash = ?3, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?4`,
			)
			.bind(nextDisplayName, nextIsActive ? 1 : 0, nextPasswordHash, userId)
			.run();
	} else {
		await db
			.prepare(
				`UPDATE users
				SET display_name = ?1, is_active = ?2, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?3`,
			)
			.bind(nextDisplayName, nextIsActive ? 1 : 0, userId)
			.run();
	}

	if (input.roleIds) {
		await replaceUserRoles(db, userId, input.roleIds, assignedByUserId);
	}

	return {
		id: existingUser.id,
		email: existingUser.email,
		displayName: nextDisplayName,
		isActive: nextIsActive,
		roles: await getRoleSummariesForUser(db, userId),
	};
}

async function getRoleSummariesForUser(db: D1Database, userId: number): Promise<RoleSummary[]> {
	const result = await db
		.prepare(
			`SELECT r.id, r.name, r.label
			FROM roles r
			INNER JOIN user_roles ur ON ur.role_id = r.id
			WHERE ur.user_id = ?1
			ORDER BY r.label ASC, r.id ASC`,
		)
		.bind(userId)
		.all<RoleSummary>();

	return result.results ?? [];
}
