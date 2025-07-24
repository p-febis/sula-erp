import { pgTable, integer, varchar, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  password: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const sessionsTable = pgTable("sessions", {
  id: text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  secretHash: text().notNull(),
});
