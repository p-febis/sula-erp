import { Role, Permission, DB, User } from "@/db/db";

import {
  CreateRoleDto,
  DeleteAssociationsFromRoleDto,
  UpdateRoleDto,
} from "@/models/authorization";
import { Selectable } from "kysely";
import { Kysely } from "kysely";

export interface IAuthorizationRepository {
  createRole(roleCreationData: CreateRoleDto): Promise<Selectable<Role> | null>;
  findAllRoles(): Promise<Selectable<Role>[] | null>;
  findAllPermissions(): Promise<Selectable<Permission>[] | null>;
  updateRole(
    roleId: number,
    roleUpdateData: UpdateRoleDto,
  ): Promise<Selectable<Role> | null>;
  unlinkRoleAssociations(
    roleId: number,
    roleDeleteFromData: DeleteAssociationsFromRoleDto,
  ): Promise<Selectable<Role> | null>;
  findRoleById(roleId: number): Promise<Selectable<Role> | null>;
  getUserPermissions(userId: number): Promise<string[]>;
}

export class AuthorizationRepository implements IAuthorizationRepository {
  client: Kysely<DB>;

  constructor(client: Kysely<DB>) {
    this.client = client;
  }

  async createRole(roleCreationData: CreateRoleDto) {
    const role =
      (await this.client
        .insertInto("role")
        .values(roleCreationData)
        .returningAll()
        .executeTakeFirst()) ?? null;

    return role;
  }

  async findAllRoles() {
    const roles = await this.client.selectFrom("role").selectAll().execute();

    return roles;
  }

  async updateRole(roleId: number, { userIds, permissionIds }: UpdateRoleDto) {
    if (userIds.length > 0) {
      await this.client
        .insertInto("user_role")
        .values(userIds.map((userId) => ({ user_id: userId, role_id: roleId })))
        .onConflict((oc) => oc.columns(["user_id", "role_id"]).doNothing())
        .execute();
    }

    if (permissionIds.length > 0) {
      await this.client
        .insertInto("role_permission")
        .values(
          permissionIds.map((permissionId) => ({
            permission_id: permissionId,
            role_id: roleId,
          })),
        )
        .onConflict((oc) =>
          oc.columns(["permission_id", "role_id"]).doNothing(),
        )
        .execute();
    }

    const role = await this.findRoleById(roleId);

    return role;
  }

  async findRoleById(roleId: number) {
    const roleRows = await this.client
      .selectFrom("role")
      .leftJoin("user_role", "role.id", "user_role.role_id")
      .leftJoin("user", "user_role.user_id", "user.id")

      .leftJoin("role_permission", "role.id", "role_permission.role_id")
      .leftJoin("permission", "role_permission.permission_id", "permission.id")
      .where("role.id", "=", roleId)
      .select([
        "role.id as role_id",
        "role.name as role_name",
        "user.username as user_username",
        "user.id as user_id",
        "user.is_super_user as user_is_super_user",
        "permission.key as permission_key",
        "permission.id as permission_id",
      ])
      .execute();

    const userMap = new Map<number, Partial<Selectable<User>>>();
    const permissionMap = new Map<number, Selectable<Permission>>();

    for (const row of roleRows) {
      if (
        row.user_id !== null &&
        row.user_username !== null &&
        row.user_is_super_user !== null &&
        !userMap.has(row.user_id)
      ) {
        userMap.set(row.user_id, {
          id: row.user_id,
          username: row.user_username,
          is_super_user: row.user_is_super_user,
        });
      }

      if (
        row.permission_id !== null &&
        row.permission_key !== null &&
        !permissionMap.has(row.permission_id)
      ) {
        permissionMap.set(row.permission_id, {
          id: row.permission_id,
          key: row.permission_key,
        });
      }
    }

    const parsedRole = {
      id: roleRows[0].role_id,
      name: roleRows[0].role_name,
      users: Array.from(userMap.values()),
      permissions: Array.from(permissionMap.values()),
    };

    return parsedRole;
  }

  async findAllPermissions() {
    const permissions = await this.client
      .selectFrom("permission")
      .selectAll()
      .execute();
    return permissions;
  }

  async unlinkRoleAssociations(
    roleId: number,
    deleteFromRoleData: DeleteAssociationsFromRoleDto,
  ) {
    const { userIds, permissionIds } = deleteFromRoleData;

    if (userIds.length > 0) {
      await this.client
        .deleteFrom("user_role")
        .where("role_id", "=", roleId)
        .where("user_id", "in", userIds)
        .execute();
    }

    if (permissionIds.length > 0) {
      await this.client
        .deleteFrom("role_permission")
        .where("role_id", "=", roleId)
        .where("permission_id", "in", permissionIds)
        .execute();
    }

    const role = await this.findRoleById(roleId);

    return role;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const permissions = await this.client
      .selectFrom("permission")
      .innerJoin(
        "role_permission",
        "permission.id",
        "role_permission.permission_id",
      )
      .innerJoin("user_role", "role_permission.role_id", "user_role.role_id")
      .where("user_role.user_id", "=", userId)
      .selectAll(["permission"])
      .execute();

    return permissions.map((permission) => permission.key);
  }
}
