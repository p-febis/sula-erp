import type { ColumnDef } from "@tanstack/react-table";

export const roleListColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
