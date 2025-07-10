import { CustomerList } from "../components/CustomerList";
import { useCustomers } from "../hooks/use-customers";

export const CustomersPage = () => {
  const { data } = useCustomers();

  return <CustomerList customers={data} />;
};
