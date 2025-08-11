import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
@Injectable()
export class RolesRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(role: CreateRoleDto) {
    try {
      const createdRole = await this.drizzle
        .insert(schema.rolesTable)
        .values([role]);

      return ok(createdRole);
    } catch (e) {
      return err("Failed to insert");
    }
  }

  async findAll() {
    try {
      const roles = await this.drizzle.select().from(schema.rolesTable);

      return ok(roles);
    } catch (e) {
      return err("Failed to select");
    }
  }

  async findOne(id: number) {
    try {
      const usersPromise = this.drizzle
        .select({
          id: schema.usersTable.id,
          username: schema.usersTable.username,
          email: schema.usersTable.email,
          isSuperUser: schema.usersTable.isSuperUser,
        })
        .from(schema.usersTable)
        .innerJoin(
          schema.usersRolesTable,
          eq(schema.usersRolesTable.userId, schema.usersTable.id),
        );

      const permissionsPromise = this.drizzle
        .select({
          id: schema.permissionsTable.id,
          name: schema.permissionsTable.name,
        })
        .from(schema.permissionsTable)
        .innerJoin(
          schema.permissionsRolesTable,
          eq(
            schema.permissionsRolesTable.permissionId,
            schema.permissionsTable.id,
          ),
        );

      const rolePromise = this.drizzle
        .select()
        .from(schema.rolesTable)
        .where(eq(schema.rolesTable.id, id));

      const [roles, users, permissions] = await Promise.all([
        rolePromise,
        usersPromise,
        permissionsPromise,
      ]);

      const [role] = roles;

      return ok({
        ...role,
        users,
        permissions,
      });
    } catch (e) {
      console.log(e);
      return err("Failed to select");
    }
  }

  async updateOne(id: number, updateRoleData: UpdateRoleDto) {
    try {
      const role = await this.drizzle
        .update(schema.rolesTable)
        .set(updateRoleData)
        .where(eq(schema.rolesTable.id, id))
        .returning();

      return ok(role);
    } catch (e) {
      return err("Failed to update");
    }
  }

  async deleteOne(id: number) {
    try {
      const role = await this.drizzle
        .delete(schema.rolesTable)
        .where(eq(schema.rolesTable.id, id))
        .returning();

      return ok(role);
    } catch (e) {
      return err("Failed to delete");
    }
  }
}
