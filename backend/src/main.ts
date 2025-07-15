import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";
import { UserController } from "./controllers/UserController";
import { H3, onError, serve } from "h3";
import { CustomerRepository } from "./repositories/CustomerRepository";
import { CustomerService } from "./services/CustomerService";
import { CustomerController } from "./controllers/CustomerController";
import { authMiddleware } from "./middleware/auth-guard";
import { AuthorizationRepository } from "./repositories/AuthorizationRepository";
import { AuthorizationService } from "./services/AuthorizationService";
import { AuthorizationController } from "./controllers/AuthorizationController";
import { ErrorResponse } from "./responses/api";

import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./db/db";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
});

async function main() {
  const authorizationRepository = new AuthorizationRepository(db);
  const authorizationService = new AuthorizationService(
    authorizationRepository,
  );
  const authorizationController = new AuthorizationController(
    authorizationService,
  );

  const customerRepository = new CustomerRepository(db);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController(
    customerService,
    authorizationService,
  );

  const userRepository = new UserRepository(db);
  const userService = new UserService(userRepository, authorizationRepository);
  const userController = new UserController(userService, authorizationService);

  const app = new H3();

  app.use(async (event, next) => {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;
    console.log(`${event.req.method} ${event.req.url} - ${duration}ms`);

    return response;
  });

  app.use(
    onError((error) => {
      if (error.cause instanceof ErrorResponse) {
        return new Response(JSON.stringify(error.cause), {
          ...error.cause,
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        });
      }

      console.log("Error:", error);
    }),
  );

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
    .get(
      "/permissions",
      authorizationController.getAllPermissions.bind(authorizationController),
    )
    .get(
      "/roles/:id",
      authorizationController.getOneRole.bind(authorizationController),
    )
    .post(
      "/roles",
      authorizationController.postCreateRole.bind(authorizationController),
    )
    .patch(
      "/roles/:id/associations",
      authorizationController.patchUpdateRole.bind(authorizationController),
    )
    .delete(
      "/roles/:id/associations",
      authorizationController.deleteUnlinkRoleAssociations.bind(
        authorizationController,
      ),
    );

  app
    .get("/users", userController.getAllUsers.bind(userController))
    .get("/users/me", userController.getUserIdentity.bind(userController));

  serve(app);
}

main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (e) => {
    console.error(e);
    await db.destroy();
    process.exit(1);
  });
