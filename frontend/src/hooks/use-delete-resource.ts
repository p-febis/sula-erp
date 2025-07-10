import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";

type SettledFunction<T> = (data?: T, error?: Error | null) => void;

export const useDeleteResource = <T>(
  resource: string,
  id: string | number,
  onSettled: SettledFunction<T>,
) => {
  const { mutate, mutateAsync, ...restMutation } = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(`/api/${resource}/${id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
    onSettled,
  });

  return {
    delete$: mutate,
    deleteAsync: mutateAsync,
    ...restMutation,
  };
};
