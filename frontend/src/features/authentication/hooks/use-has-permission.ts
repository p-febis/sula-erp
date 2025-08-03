import { useAuthentication } from "../components/AuthenticationProvider";

export const useHasPermissions = (permissions: string[]) => {
  const { userIdentity } = useAuthentication();
  const hasPermission = permissions.every((value) =>
    userIdentity?.permissions.includes(value),
  );

  return hasPermission || userIdentity?.isSuperUser;
};
