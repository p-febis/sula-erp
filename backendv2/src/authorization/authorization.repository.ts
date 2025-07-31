import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { CreateRoleDto } from "./dto/create-role.dto";
import { eq } from "drizzle-orm";
import { UpdateRoleAssociationsDto } from "./dto/update-role-associations.dto";

@Injectable()
export class AuthorizationRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async createRole(role: CreateRoleDto) {
    try {
      const roleList = await this.drizzle
        .insert(schema.rolesTable)
        .values(role)
        .returning();

      const [roleRecord] = roleList;

      return ok(roleRecord ?? null);
    } catch (e) {
      return err("Failed to create role");
    }
  }

  async findAllPermissionsForUser(userId: number) {
    try {
      const returnList = await this.drizzle
        .select()
        .from(schema.usersRolesTable)
        .where(eq(schema.usersRolesTable.userId, userId))
        .innerJoin(
          schema.permissionsRolesTable,
          eq(
            schema.usersRolesTable.roleId,
            schema.permissionsRolesTable.roleId,
          ),
        )
        .innerJoin(
          schema.permissionsTable,
          eq(
            schema.permissionsRolesTable.permissionId,
            schema.permissionsTable.id,
          ),
        );

      const permissionList = returnList.map(
        ({ permissions }) => permissions.name,
      );

      const deduplicatedPermissions = Array.from(new Set(permissionList));

      return ok(deduplicatedPermissions ?? null);
    } catch (e) {
      return err("Failed to find roles for user");
    }
  }

  async findRoleById(roleId: number) {
    try {
      const returnList = await this.drizzle
        .select()
        .from(schema.rolesTable)
        .leftJoin(
          schema.usersRolesTable,
          eq(schema.rolesTable.id, schema.usersRolesTable.roleId),
        )
        .leftJoin(
          schema.usersTable,
          eq(schema.usersRolesTable.userId, schema.usersTable.id),
        )
        .leftJoin(
          schema.permissionsRolesTable,
          eq(schema.rolesTable.id, schema.permissionsRolesTable.roleId),
        )
        .leftJoin(
          schema.permissionsTable,
          eq(
            schema.permissionsRolesTable.permissionId,
            schema.permissionsTable.id,
          ),
        )
        .where(eq(schema.rolesTable.id, roleId));

      const usersMap = returnList.reduce((map, { users }) => {
        const { password, email, ...restUser } = users;

        map.set(restUser.id, restUser);
        return map;
      }, new Map<number, { id: number; username: string }>());

      const permissionsMap = returnList.reduce((map, { permissions }) => {
        map.set(permissions.id, permissions);
        return map;
      }, new Map<number, { id: number; name: string }>());

      return ok({
        id: returnList[0].permissions.id,
        name: returnList[0].permissions.name,
        users: Array.from(usersMap.values()),
        permissions: Array.from(permissionsMap.values()),
      });
    } catch (e) {
      return err("Failed to find role by id");
    }
  }

  async createRoleAssociations(
    roleId: number,
    { userIds, permissionIds }: UpdateRoleAssociationsDto,
  ) {
    try {
      await this.drizzle.transaction(async (tx) => {
        tx.insert(schema.usersRolesTable)
          .values(userIds.map((userId) => ({ userId, roleId })))
          .returning({});
        tx.insert(schema.permissionsRolesTable).values(
          permissionIds.map((permissionId) => ({ roleId, permissionId })),
        );
      });
    } catch (e) {
      return err("Failed to create role associations");
    }

    const role = await this.findRoleById(roleId);

    return role;
  }
}
