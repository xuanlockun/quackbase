export interface RoleSummary {
	id: number;
	name: string;
	label: string;
}

export interface AdminPermission {
	id: number;
	name: string;
	label: string;
	description: string | null;
	resource: string;
	action: string;
}

export interface AdminRole extends RoleSummary {
	description: string | null;
	isSystem: boolean;
	permissions: AdminPermission[];
}

export interface AdminUserSummary {
	id: number;
	email: string;
	displayName: string;
	isActive: boolean;
	roles: RoleSummary[];
}

export interface AdminAuthUser {
	id: number;
	email: string;
	displayName: string;
	passwordHash: string;
	isActive: boolean;
	lastLoginAt: string | null;
}

export interface AdminSession {
	userId: number;
	email: string;
	displayName: string;
	isActive: boolean;
	roles: RoleSummary[];
	permissions: string[];
	isSuperadmin: boolean;
}

export interface CreateAdminUserInput {
	email: string;
	displayName: string;
	passwordHash: string;
	isActive: boolean;
	roleIds: number[];
}

export interface UpdateAdminUserInput {
	displayName?: string;
	passwordHash?: string;
	isActive?: boolean;
	roleIds?: number[];
}

export interface CreateRoleInput {
	name: string;
	label: string;
	description?: string | null;
	permissionIds: number[];
}

export interface UpdateRoleInput {
	label?: string;
	description?: string | null;
	permissionIds?: number[];
}
