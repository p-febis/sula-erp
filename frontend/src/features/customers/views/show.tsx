import { EmailField, Show, SimpleShowLayout, TextField } from "react-admin";

export const CustomerShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="phone" />
    </SimpleShowLayout>
  </Show>
);
