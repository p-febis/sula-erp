import { PrismaClient } from "@/../generated/prisma";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";
import { H3, serve } from "h3";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { CustomerService } from "./services/CustomerService";
import { CustomerController } from "./controllers/CustomerController";
import { authMiddleware } from "./middleware/auth-guard";
import { AuthorizationRepository } from "./repositories/AuthorizationRepository";
import { AuthorizationService } from "./services/AuthorizationService";
import { AuthorizationController } from "./controllers/AuthorizationController";

const prisma = new PrismaClient();

async function main() {
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  const customerRepository = new CustomerRepository(prisma);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController(customerService);

  const authorizationRepository = new AuthorizationRepository(prisma);
  const authorizationService = new AuthorizationService(
    authorizationRepository,
  );
  const authorizationController = new AuthorizationController(
    authorizationService,
  );

  const app = new H3({
    onError: console.log,
  });

  app.use(authMiddleware("/auth/"));

  app
    .post("/auth/create", userController.postCreate.bind(userController))
    .post("/auth/login", userController.postLogin.bind(userController))
    .post("/auth/refresh", userController.postRefresh.bind(userController));

  app
    .get("/customers", customerController.getAll.bind(customerController))
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

  app
    .get(
      "/roles",
      authorizationController.getAllRoles.bind(authorizationController),
    )
    .post(
      "/roles",
      authorizationController.postCreateRole.bind(authorizationController),
    )
    .patch(
      "/roles/:id/users",
      authorizationController.patchAddUsersToRole.bind(authorizationController),
    );

  app.get("/users", userController.getAllUsers.bind(userController));

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
