import type { AdminPermission, RoleSummary } from "../auth/types";

function uniqueNumberIds(ids: number[]): number[] {
	return [...new Set(ids.filter((value) => Number.isInteger(value) && value > 0))];
}

export async function listPermissions(db: D1Database): Promise<AdminPermission[]> {
	const result = await db
		.prepare(
			`SELECT id, name, label, description, resource, action
			FROM permissions
			ORDER BY resource ASC, action ASC, id ASC`,
		)
		.all<AdminPermission>();

	return result.results ?? [];
}

export async function getEffectiveAccessForUser(
	db: D1Database,
	userId: number,
): Promise<{ roles: RoleSummary[]; permissions: AdminPermission[] }> {
	const roleRows = await db
		.prepare(
			`SELECT DISTINCT r.id, r.name, r.label
			FROM roles r
			INNER JOIN user_roles ur ON ur.role_id = r.id
			WHERE ur.user_id = ?1
			ORDER BY r.label ASC, r.id ASC`,
		)
		.bind(userId)
		.all<RoleSummary>();

	const permissionRows = await db
		.prepare(
			`SELECT DISTINCT p.id, p.name, p.label, p.description, p.resource, p.action
			FROM permissions p
			INNER JOIN role_permissions rp ON rp.permission_id = p.id
			INNER JOIN user_roles ur ON ur.role_id = rp.role_id
			WHERE ur.user_id = ?1
			ORDER BY p.resource ASC, p.action ASC, p.id ASC`,
		)
		.bind(userId)
		.all<AdminPermission>();

	return {
		roles: roleRows.results ?? [],
		permissions: permissionRows.results ?? [],
	};
}

export async function replaceRolePermissions(
	db: D1Database,
	roleId: number,
	permissionIds: number[],
	assignedByUserId?: number,
): Promise<void> {
	const uniqueIds = uniqueNumberIds(permissionIds);
	const statements = [db.prepare(`DELETE FROM role_permissions WHERE role_id = ?1`).bind(roleId)];

	for (const permissionId of uniqueIds) {
		statements.push(
			db
				.prepare(
					`INSERT INTO role_permissions (role_id, permission_id, assigned_by_user_id)
					VALUES (?1, ?2, ?3)`,
				)
				.bind(roleId, permissionId, assignedByUserId ?? null),
		);
	}

	await db.batch(statements);
}
