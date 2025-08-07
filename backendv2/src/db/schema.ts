import { pgTable, integer, varchar, text, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  password: text().notNull(),
  isSuperUser: boolean().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const sessionsTable = pgTable("sessions", {
  id: text().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  secretHash: text().notNull(),
});

export const rolesTable = pgTable("roles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});

export const usersRolesTable = pgTable("users_roles", {
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  roleId: integer()
    .notNull()
    .references(() => rolesTable.id),
});

export const permissionsTable = pgTable("permissions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const permissionsRolesTable = pgTable("permissions_roles", {
  roleId: integer()
    .notNull()
    .references(() => rolesTable.id),
  permissionId: integer()
    .notNull()
    .references(() => permissionsTable.id),
});

export const customersTable = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 255 }),
});
