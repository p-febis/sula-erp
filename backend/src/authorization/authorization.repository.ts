import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class AuthorizationRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

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
}
