import { DataTable } from "@/components/data-table";
import type { Customer } from "../types/customer";
import { customerListColumns } from "../types/columns";

export const CustomerList = ({ customers }: { customers: Customer[] }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <main className="h-fit md:w-4/5 p-4">
        <DataTable columns={customerListColumns} data={customers} />
      </main>
    </div>
  );
};
