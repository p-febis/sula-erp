import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { CreateRoleDto } from "./dto/create-role.dto";
import { eq } from "drizzle-orm";

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
      const permissionList = await this.drizzle
        .select()
        .from(schema.permissionsTable)
        .innerJoin(
          schema.usersPermissionsTable,
          eq(
            schema.permissionsTable.id,
            schema.usersPermissionsTable.permissionId,
          ),
        )
        .where(eq(schema.usersPermissionsTable.userId, userId));

      const deduplicatedPermissions = Array.from(
        new Set(permissionList.map((r) => r.permissions.name)),
      );

      return ok(deduplicatedPermissions ?? null);
    } catch (e) {
      return err("Failed to find roles for user");
    }
  }
}
