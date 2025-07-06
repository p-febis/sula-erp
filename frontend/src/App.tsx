import { Admin, ListGuesser, Resource } from "react-admin";
import { Layout } from "./Layout";
import { authProvider } from "./features/auth/auth-provider";
import simpleRestProvider from "ra-data-simple-rest";

const dataProvider = simpleRestProvider("/api");

export const App = () => (
    <Admin layout={Layout} authProvider={authProvider} dataProvider={dataProvider}>
	<Resource name="customers" list={ListGuesser} />
    </Admin>
);
