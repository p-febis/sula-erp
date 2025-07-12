import { PrismaClient } from "generated/prisma";

const prisma = new PrismaClient();

const models = ["customer", "role", "user", "permission"];
const actions = ["create", "read", "update", "delete"];

console.log("Seeding permissions...");

async function main() {
  for (const model of models) {
    for (const action of actions) {
      const key = `${action}:${model}`;

      await prisma.permission.upsert({
	where: { key },
	update: {},
	create: { key },
      });
    }
  }

  console.log("Permissions seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
