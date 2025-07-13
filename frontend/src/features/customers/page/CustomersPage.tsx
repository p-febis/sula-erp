import { CustomerList } from "../components/CustomerList";
import { useCustomers } from "../hooks/use-customers";

export const CustomersPage = () => {
  const { data, isLoading } = useCustomers();

  if(isLoading) {
    return <>Loading...</>;
  }

  return <CustomerList customers={data} />;
};
