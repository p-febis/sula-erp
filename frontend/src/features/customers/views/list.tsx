import { DataTable, EmailField, List } from "react-admin";

export const CustomerList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="name" />
      <DataTable.Col source="email">
        <EmailField source="email" />
      </DataTable.Col>
      <DataTable.Col source="phone" />
    </DataTable>
  </List>
);
