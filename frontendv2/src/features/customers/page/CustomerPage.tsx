import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { CustomerEdit } from "../components/CustomerEdit";

export const CustomerPage = () => {
  let { customerId } = useParams();

  const { data } = useSuspenseQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/customers/${customerId}`);
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });

  return <CustomerEdit customer={data} />;
};
