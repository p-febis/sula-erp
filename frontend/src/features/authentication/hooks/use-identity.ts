import { AUTHENTICATION_STALE_TIME } from "@/constants";
import { queryOptions, useQuery } from "@tanstack/react-query"
import { fetchWithAuth } from "../lib/fetchWithAuth";

export const useIdentityOptions = () => {
  return queryOptions({
    queryKey: ["users", "me"],
    staleTime: AUTHENTICATION_STALE_TIME,
    queryFn: async () => {
      const response = await fetchWithAuth("/api/users/me");
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  })
}

export const useIdentity = () => {
  const { data, ...restQuery } = useQuery(useIdentityOptions());

  return {
    userIdentity: data,
    ...restQuery
  }
}
