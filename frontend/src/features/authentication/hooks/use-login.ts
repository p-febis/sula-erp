import { mutationOptions, useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";

type SettledFunction = (
  data?: { accessToken: string },
  error?: Error | null,
) => void;

const loginOptions = (onSettled: SettledFunction) => {
  return mutationOptions({
    mutationKey: ["auth", "login"],
    mutationFn: async (body: { username: string; password: string }) => {
      const response = await fetchWithAuth(`/api/authentication/login`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
    onSettled,
  });
};

export const useLogin = (onSettled: SettledFunction) => {
  const { mutate, mutateAsync, ...restMutation } = useMutation(
    loginOptions(onSettled),
  );

  return {
    login: mutate,
    loginAsync: mutateAsync,
    ...restMutation,
  };
};
