import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";

export const usePermissions = () => {
  const { data: permissions, ...restQuery } = useSuspenseQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/permissions`);
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });

  return { permissions, ...restQuery };
};
