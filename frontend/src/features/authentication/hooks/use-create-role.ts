import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import type { Role } from "../types/role";

type SettledFunction = (data?: Role, error?: Error | null) => void;

export const useCreateRole = (onSettled: SettledFunction) => {
  const { mutate, mutateAsync, ...restMutation } = useMutation({
    mutationKey: ["roles"],
    mutationFn: async (body: Omit<Role, "id">) => {
      const response = await fetchWithAuth(`/api/roles`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
    onSettled,
  });

  return {
    create: mutate,
    createAsync: mutateAsync,
    ...restMutation,
  };
};
