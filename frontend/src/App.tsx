import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import { DashBoardLayout } from "./features/dashboard/components/DashBoardLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomersPage } from "./features/customers/page/CustomersPage";
import { CustomerPage } from "./features/customers/page/CustomerPage";
import { CustomerCreatePage } from "./features/customers/page/CustomerCreatePage";

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
	  ]
	},
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
