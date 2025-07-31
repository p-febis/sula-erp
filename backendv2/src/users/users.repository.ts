import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { eq, count } from "drizzle-orm";

@Injectable()
export class UsersRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(creationData: typeof schema.usersTable.$inferInsert) {
    try {
      const usersList = await this.drizzle
        .insert(schema.usersTable)
        .values(creationData)
        .returning();

      const [user] = usersList;

      return ok(user ?? null);
    } catch (e) {
      return err("Failed to insert");
    }
  }

  async findByEmail(email: string) {
    try {
      const users = await this.drizzle
        .select()
        .from(schema.usersTable)
        .where(eq(schema.usersTable.email, email));

      const user = users[0] ?? null;

      return ok(user);
    } catch (e) {
      return err("Failed to select");
    }
  }

  async findById(id: number) {
    try {
      const users = await this.drizzle
        .select()
        .from(schema.usersTable)
        .where(eq(schema.usersTable.id, id));

      const user = users[0] ?? null;

      return ok(user);
    } catch (e) {
      return err("Failed to select");
    }
  }

  async isFirstUser() {
    try {
      const [{ count: totalUsers }] = await this.drizzle
        .select({
          count: count(),
        })
        .from(schema.usersTable);

      return ok(totalUsers === 0);
    } catch (e) {
      return err("Failed to select");
    }
  }
}
