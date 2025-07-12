import { useMutation } from "@tanstack/react-query"
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import type { User } from "../types/user";
import { useRole } from "../hooks/use-role";
import { useUsers } from "../hooks/use-users";
import { usePermissions } from "../hooks/use-permissions";

export const RoleEdit = ({ roleId }: { roleId?: string }) => {

  const { role } = useRole(roleId);
  const { users } = useUsers();
  const { permissions } = usePermissions();

  const userOptions = users.map(({ username, id }: User) => ({ label: username, value: id}));
  const permissionOptions = permissions.map(({ key, id }: { key: string; id: number }) => ({ label: key, value: id }));

  const { mutate } = useMutation({
    mutationFn: async (body: { permissionIds: number[], userIds: number[] }) => {
      const response = await fetchWithAuth(`/api/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });

  const form = useForm({
    defaultValues: {
      userIds: role.users.map(({ userId }) => userId),
      permissionIds: role.permissions.map(({ permissionId }) => permissionId),
    },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  return ( 
    <div className="p-4 flex items-center justify-center h-full">
      <Card>
        <CardHeader>
          <CardTitle>Edit role '{role.name}'</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="w-sm md:min-w-md space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
	    <form.Field
	      name="userIds"
	      children={(field) => (
		<>
                  <label htmlFor={field.name}>Users:</label>
		  <MultiSelect 
		    options={userOptions}
                    id={field.name}
                    name={field.name}
                    value={field.state.value.map(String)}
		    defaultValue={field.state.value as unknown as string[]}
                    onBlur={field.handleBlur}
                    onValueChange={(value) => {
		      field.handleChange(value.map(Number));
		    }}
		  />
		</>
	      )}
	      />
	      <form.Field
		name="permissionIds"
		children={(field) => (
		  <>
		    <label htmlFor={field.name}>Permissions:</label>
		    <MultiSelect 
		      options={permissionOptions}
		      id={field.name}
		      name={field.name}
		      value={field.state.value.map(String)}
		      defaultValue={field.state.value as unknown as string[]}
		      onBlur={field.handleBlur}
		      onValueChange={(value) => {
			field.handleChange(value.map(Number));
		      }}
		    />
		  </>
		)}
		/>
            <div className="w-full inline-flex justify-between">
              <Button type="submit" disabled={isDefaultValue}>
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
	 );
}
