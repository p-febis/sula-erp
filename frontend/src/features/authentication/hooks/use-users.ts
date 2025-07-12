import { useSuspenseQuery } from "@tanstack/react-query"
import { fetchWithAuth } from "../lib/fetchWithAuth";

export const useUsers = () => {
    const { data: users, ...restQuery } = useSuspenseQuery({
      queryKey: ["users"],
      queryFn: async () => {
	const response = await fetchWithAuth(`/api/users`);
	const json = await response.json();

	if (!response.ok) throw new Error(JSON.stringify(json));
	return json.data;
      }
    });

    return { users, ...restQuery };
}
