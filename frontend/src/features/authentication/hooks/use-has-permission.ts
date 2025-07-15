import { useContext } from "react";
import { AuthenticationContext } from "../components/AuthenticationProvider";

export const useHasPermissions = (permissions: string[]) => {
  const { userIdentity } = useContext(AuthenticationContext);
  const hasPermission = permissions.every((value) =>
    userIdentity?.permissions.includes(value),
  );

  return hasPermission || userIdentity?.user.is_super_user;
}
