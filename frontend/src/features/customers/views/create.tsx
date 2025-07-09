import { Create, SimpleForm, TextInput } from "react-admin";

export const CustomerCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="email" />
        <TextInput source="phone" />
      </SimpleForm>
    </Create>
  );
};
