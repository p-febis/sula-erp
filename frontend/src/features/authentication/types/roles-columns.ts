import type { ColumnDef } from "@tanstack/react-table";
import type { Role } from "./role";

export const roleListColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
