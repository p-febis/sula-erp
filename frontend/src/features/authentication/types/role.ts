import type { Permission } from "./permission";
import type { User } from "./user";

export type Role = {
  id: number;
  name: string;
  users: { user: User; userId: number }[];
  permissions: { permission: Permission; permissionId: number }[];
};
