import { useParams } from "react-router";
import { CustomerEdit } from "../components/CustomerEdit";
import { useCustomer } from "../hooks/use-customer";

export const CustomerPage = () => {
  let { customerId } = useParams();

  if (!customerId) {
    return <>You probably shouldn't be here</>;
  }

  const { data } = useCustomer(customerId);

  return <CustomerEdit customer={data} />;
};
