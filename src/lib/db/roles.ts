import type { AdminRole, CreateRoleInput, RoleSummary, UpdateRoleInput } from "../auth/types";
import { replaceRolePermissions } from "./permissions";

function normalizeOptionalText(value?: string | null): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

function uniqueNumberIds(ids: number[]): number[] {
	return [...new Set(ids.filter((value) => Number.isInteger(value) && value > 0))];
}

export async function listRoleSummaries(db: D1Database): Promise<RoleSummary[]> {
	const result = await db
		.prepare(`SELECT id, name, label FROM roles ORDER BY is_system DESC, label ASC, id ASC`)
		.all<RoleSummary>();

	return result.results ?? [];
}

export async function listRolesWithPermissions(db: D1Database): Promise<AdminRole[]> {
	const rolesResult = await db
		.prepare(
			`SELECT id, name, label, description, is_system as isSystem
			FROM roles
			ORDER BY is_system DESC, label ASC, id ASC`,
		)
		.all<{ id: number; name: string; label: string; description: string | null; isSystem: number }>();

	const permissionsResult = await db
		.prepare(
			`SELECT r.id as roleId, p.id, p.name, p.label, p.description, p.resource, p.action
			FROM roles r
			LEFT JOIN role_permissions rp ON rp.role_id = r.id
			LEFT JOIN permissions p ON p.id = rp.permission_id
			ORDER BY r.id ASC, p.resource ASC, p.action ASC, p.id ASC`,
		)
		.all<{
			roleId: number;
			id: number | null;
			name: string | null;
			label: string | null;
			description: string | null;
			resource: string | null;
			action: string | null;
		}>();

	const roles = (rolesResult.results ?? []).map<AdminRole>((role) => ({
		id: role.id,
		name: role.name,
		label: role.label,
		description: role.description,
		isSystem: role.isSystem === 1,
		permissions: [],
	}));

	const roleMap = new Map(roles.map((role) => [role.id, role]));
	for (const row of permissionsResult.results ?? []) {
		if (!row.id || !row.name || !row.label || !row.resource || !row.action) {
			continue;
		}

		roleMap.get(row.roleId)?.permissions.push({
			id: row.id,
			name: row.name,
			label: row.label,
			description: row.description,
			resource: row.resource,
			action: row.action,
		});
	}

	return roles;
}

export async function getRoleById(db: D1Database, roleId: number): Promise<AdminRole | null> {
	const role = await db
		.prepare(
			`SELECT id, name, label, description, is_system as isSystem
			FROM roles
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(roleId)
		.first<{ id: number; name: string; label: string; description: string | null; isSystem: number }>();

	if (!role) {
		return null;
	}

	const permissions = await db
		.prepare(
			`SELECT p.id, p.name, p.label, p.description, p.resource, p.action
			FROM role_permissions rp
			INNER JOIN permissions p ON p.id = rp.permission_id
			WHERE rp.role_id = ?1
			ORDER BY p.resource ASC, p.action ASC, p.id ASC`,
		)
		.bind(roleId)
		.all<AdminRole["permissions"][number]>();

	return {
		id: role.id,
		name: role.name,
		label: role.label,
		description: role.description,
		isSystem: role.isSystem === 1,
		permissions: permissions.results ?? [],
	};
}

export async function createRole(
	db: D1Database,
	input: CreateRoleInput,
	assignedByUserId?: number,
): Promise<AdminRole> {
	const name = input.name.trim().toLowerCase();
	const label = input.label.trim();

	await db
		.prepare(
			`INSERT INTO roles (name, label, description, is_system, updated_at)
			VALUES (?1, ?2, ?3, 0, CURRENT_TIMESTAMP)`,
		)
		.bind(name, label, normalizeOptionalText(input.description))
		.run();

	const createdRole = await db
		.prepare(
			`SELECT id, name, label, description, is_system as isSystem
			FROM roles
			WHERE name = ?1
			LIMIT 1`,
		)
		.bind(name)
		.first<{ id: number; name: string; label: string; description: string | null; isSystem: number }>();

	if (!createdRole) {
		throw new Error("Role could not be created.");
	}

	await replaceRolePermissions(db, createdRole.id, input.permissionIds, assignedByUserId);

	return {
		id: createdRole.id,
		name: createdRole.name,
		label: createdRole.label,
		description: createdRole.description,
		isSystem: createdRole.isSystem === 1,
		permissions: (await listRolesWithPermissions(db)).find((role) => role.id === createdRole.id)?.permissions ?? [],
	};
}

export async function updateRole(
	db: D1Database,
	roleId: number,
	input: UpdateRoleInput,
	assignedByUserId?: number,
): Promise<AdminRole | null> {
	const existingRole = await db
		.prepare(
			`SELECT id, name, label, description, is_system as isSystem
			FROM roles
			WHERE id = ?1
			LIMIT 1`,
		)
		.bind(roleId)
		.first<{ id: number; name: string; label: string; description: string | null; isSystem: number }>();

	if (!existingRole) {
		return null;
	}

	const nextLabel = input.label?.trim() ? input.label.trim() : existingRole.label;
	const nextDescription =
		input.description === undefined ? existingRole.description : normalizeOptionalText(input.description);

	await db
		.prepare(
			`UPDATE roles
			SET label = ?1, description = ?2, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?3`,
		)
		.bind(nextLabel, nextDescription, roleId)
		.run();

	if (input.permissionIds) {
		await replaceRolePermissions(db, roleId, input.permissionIds, assignedByUserId);
	}

	return (await listRolesWithPermissions(db)).find((role) => role.id === roleId) ?? null;
}

export async function deleteRole(db: D1Database, roleId: number): Promise<"deleted" | "system" | "assigned" | "missing"> {
	const role = await db
		.prepare(`SELECT id, is_system as isSystem FROM roles WHERE id = ?1 LIMIT 1`)
		.bind(roleId)
		.first<{ id: number; isSystem: number }>();

	if (!role) {
		return "missing";
	}

	if (role.isSystem === 1) {
		return "system";
	}

	const assignment = await db
		.prepare(`SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?1`)
		.bind(roleId)
		.first<{ count: number }>();

	if ((assignment?.count ?? 0) > 0) {
		return "assigned";
	}

	await db.batch([
		db.prepare(`DELETE FROM role_permissions WHERE role_id = ?1`).bind(roleId),
		db.prepare(`DELETE FROM roles WHERE id = ?1`).bind(roleId),
	]);

	return "deleted";
}

export async function replaceUserRoles(
	db: D1Database,
	userId: number,
	roleIds: number[],
	assignedByUserId?: number,
): Promise<void> {
	const uniqueIds = uniqueNumberIds(roleIds);
	const statements = [db.prepare(`DELETE FROM user_roles WHERE user_id = ?1`).bind(userId)];

	for (const roleId of uniqueIds) {
		statements.push(
			db
				.prepare(
					`INSERT INTO user_roles (user_id, role_id, assigned_by_user_id)
					VALUES (?1, ?2, ?3)`,
				)
				.bind(userId, roleId, assignedByUserId ?? null),
		);
	}

	await db.batch(statements);
}
