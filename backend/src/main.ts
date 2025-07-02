import { PrismaClient } from "@/../generated/prisma";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";
import { H3, serve } from "h3";

const prisma = new PrismaClient();

async function main() {
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const app = new H3();

  app.post("/users", userController.postCreate.bind(userController));
  serve(app);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
