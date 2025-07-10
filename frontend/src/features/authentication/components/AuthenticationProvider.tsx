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

type TAuthenticationContext = {
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>> | null;
};
const AuthenticationContext = createContext<TAuthenticationContext>({
  isLoggedIn: false,
  setIsLoggedIn: null,
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

const FIFTEEN_MINUTES = 900000;
const TEN_SECONDS = 10000;

export const AuthenticationProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["auth"],
    staleTime: FIFTEEN_MINUTES - TEN_SECONDS,
    queryFn: refreshAuth,
  });

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
    <AuthenticationContext value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthenticationContext>
  );
};
