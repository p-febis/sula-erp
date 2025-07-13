import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import type { Role } from "../types/role";

export const useRole = (roleId?: string) => {
  const { data: role, ...restQuery } = useSuspenseQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/roles/${roleId}`);
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data as Role;
    },
  });

  return { role, ...restQuery };
};
