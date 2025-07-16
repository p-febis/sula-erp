import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import { Navigate } from "react-router";
import type { User } from "../types/user";
import { AUTHENTICATION_STALE_TIME } from "@/constants";
import { useIdentity } from "../hooks/use-identity";

type TAuthenticationContext = {
  isLoggedIn: boolean;
  userIdentity: { user: User; permissions: string[] } | null;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>> | null;
};
export const AuthenticationContext = createContext<TAuthenticationContext>({
  isLoggedIn: false,
  setIsLoggedIn: null,
  userIdentity: null,
});

export async function refreshAuth(): Promise<{ accessToken: string } | null> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) return null;

  const { data } = await response.json();
  return data;
}

export const AuthenticationProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["auth"],
    staleTime: AUTHENTICATION_STALE_TIME,
    queryFn: refreshAuth,
  });

  const { userIdentity } = useIdentity();

  useEffect(() => {
    if (!isLoading && data) {
      sessionStorage.setItem("accessToken", data.accessToken);
      setIsLoggedIn(true);
    }
  }, [data, isLoading]);

  if (isLoading) return <>Loading...</>;

  if (!data && !sessionStorage.getItem("accessToken")) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthenticationContext value={{ isLoggedIn, setIsLoggedIn, userIdentity }}>
      {children}
    </AuthenticationContext>
  );
};
