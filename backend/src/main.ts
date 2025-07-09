import { PrismaClient } from "@/../generated/prisma";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";
import { H3, serve } from "h3";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { CustomerService } from "./services/CustomerService";
import { CustomerController } from "./controllers/CustomerController";
import { authMiddleware } from "./middleware/auth-guard";

const prisma = new PrismaClient();

async function main() {
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const customerRepository = new CustomerRepository(prisma);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController(customerService);

  const app = new H3({
    onError: console.log
  });

  app.use(authMiddleware("/auth/"));

  app
    .post("/users", userController.postCreate.bind(userController))
    .post("/auth/login", userController.postLogin.bind(userController));

  app
    .get("/customers/:id", customerController.getOne.bind(customerController))
    .patch(
      "/customers/:id",
      customerController.updateOne.bind(customerController),
    )
    .delete(
      "/customers/:id",
      customerController.deleteOne.bind(customerController),
    )
    .post("/customers", customerController.postCreate.bind(customerController));

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
