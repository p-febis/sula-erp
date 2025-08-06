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
      const rolesList = await this.drizzle
        .select()
        .from(schema.rolesTable)
        .where(eq(schema.rolesTable.id, id));

      const [role] = rolesList;

      return ok(role ?? null);
    } catch (e) {
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
