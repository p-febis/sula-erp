import { type PropsWithChildren, type ReactNode } from "react";
import { useHasPermissions } from "../hooks/use-has-permission";

export const PermissionGaurd = ({
  children,
  permissions,
  fallback = <></>,
}: PropsWithChildren<{ permissions: string[]; fallback?: ReactNode }>) => {
  const canDo = useHasPermissions(permissions);

  if (!canDo) {
    return fallback;
  }

  return children;
};
