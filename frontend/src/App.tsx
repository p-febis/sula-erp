import { Admin, ListGuesser, Resource, ShowGuesser } from "react-admin";
import { Layout } from "./Layout";
import { authProvider } from "./features/auth/auth-provider";
import { dataProvider } from "./data-provider";
import { CustomerList } from "./features/customers/views/list";
import { CustomerShow } from "./features/customers/views/show";
import { CustomerCreate } from "./features/customers/views/create";
import PersonIcon from "@mui/icons-material/Person";

export const App = () => (
  <Admin
    layout={Layout}
    authProvider={authProvider}
    dataProvider={dataProvider}
  >
    <Resource
      icon={PersonIcon}
      name="customers"
      list={CustomerList}
      show={CustomerShow}
      create={CustomerCreate}
    />
  </Admin>
);
