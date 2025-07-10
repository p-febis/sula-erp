import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import { DashBoardLayout } from "./features/dashboard/components/DashBoardLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomersPage } from "./features/customers/page/CustomersPage";
import { CustomerPage } from "./features/customers/page/CustomerPage";
import { CustomerCreatePage } from "./features/customers/page/CustomerCreatePage";
import { LoginPage } from "./features/authentication/pages/LoginPage";
import { RolesPage } from "./features/authentication/pages/RolesPage";
import { RoleCreatePage } from "./features/authentication/pages/RoleCreatePage";

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/dashboard",
      Component: DashBoardLayout,
      children: [
        {
          path: "customers",
          children: [
            {
              index: true,
              Component: CustomersPage,
            },
            {
              path: "create",
              Component: CustomerCreatePage,
            },
            {
              path: ":customerId",
              Component: CustomerPage,
            },
          ],
        },
        {
          path: "roles",
          children: [
            {
              index: true,
              Component: RolesPage,
            },
            {
              path: "create",
              Component: RoleCreatePage,
            },
          ],
        },
      ],
    },
    {
      path: "/login",
      Component: LoginPage,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
