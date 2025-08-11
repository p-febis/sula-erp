import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class SessionRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(userId: number, id: string, secretHash: string) {
    try {
      const sessionList = await this.drizzle
        .insert(schema.sessionsTable)
        .values({
          id,
          userId,
          secretHash,
        })
        .returning();

      const [session] = sessionList;

      return ok(session ?? null);
    } catch (e) {
      return err("Failed to insert");
    }
  }

  async findById(id: string) {
    try {
      const sessionList = await this.drizzle
        .select()
        .from(schema.sessionsTable)
        .where(eq(schema.sessionsTable.id, id));

      const [session] = sessionList;

      return ok(session ?? null);
    } catch (e) {
      return err("Failed to find session");
    }
  }
}
