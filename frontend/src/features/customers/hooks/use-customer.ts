import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";

export const useCustomer = (customerId: string | number) => {
  return useSuspenseQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/customers/${customerId}`);
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });
};
