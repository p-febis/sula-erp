import { useSuspenseQuery } from "@tanstack/react-query"
import { fetchWithAuth } from "@/features/authentication/lib/fetchWithAuth";
import { DataTable } from "@/components/data-table";
import { roleListColumns } from "../types/roles-columns";

export const RolesPage = () => {

  const { data } = useSuspenseQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/roles`);
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });

  return <DataTable data={data} columns={roleListColumns} />
}
