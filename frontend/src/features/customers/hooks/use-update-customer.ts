import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import type { Customer } from "../types/customer";

type SettledFunction = (data?: Customer, error?: Error | null) => void;

export const useUpdateCustomer = (
  customerId: string | number,
  onSettled: SettledFunction,
) => {
  const { mutate, mutateAsync, ...restMutation } = useMutation({
    mutationFn: async (body: Omit<Customer, "id">) => {
      const response = await fetchWithAuth(`/api/customers/${customerId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
    onSettled,
  });

  return {
    update: mutate,
    updateAsync: mutateAsync,
    ...restMutation,
  };
};
