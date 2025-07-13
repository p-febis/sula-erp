import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const customerOptions = () => {
  return queryOptions({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetchWithAuth("/api/customers");
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });
};

export const useCustomers = () => {
  return useSuspenseQuery(customerOptions());
};
