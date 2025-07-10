import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { useSuspenseQuery } from "@tanstack/react-query"
import { CustomerList } from "../components/CustomerList";

export const CustomersPage = () => {

  const { data } = useSuspenseQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/customers");
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });


  return <CustomerList customers={data} />;
}
