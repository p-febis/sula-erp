import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";

@Injectable()
export class PermissionsRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll() {
    try {
      const permissions = await this.drizzle
        .select()
        .from(schema.permissionsTable);

      return ok(permissions);
    } catch (e) {
      return err("Failed to select");
    }
  }
}
