import type { Permission } from "./permission";
import type { User } from "./user";

export type Role = {
  id: number;
  name: string;
  users: User[];
  permissions: Permission[];
};
