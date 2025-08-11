import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import postgres from "postgres";

const RESOURCES = ["customer", "permission", "role", "user"];
const ACTIONS = ["create", "read", "update", "delete"];
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function main() {
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const name = `${action}:${resource}`;

      await db.insert(schema.permissionsTable).values({ name }).onConflictDoNothing().execute();
    }
  }
}

main()
  .catch(console.log)
  .finally(async () => {
    await client.end();
  });
