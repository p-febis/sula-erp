import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useStore } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import type { User } from "../types/user";
import { roleOptions } from "../hooks/use-role";
import { usersOptions } from "../hooks/use-users";
import { permissionOptions as permissionQueryOptions } from "../hooks/use-permissions";
import { calculateDifference } from "../lib/diff";
import { useUpdateRole } from "../hooks/use-update-role";
import { useQueries } from "@tanstack/react-query";
import type { Role } from "../types/role";
import type { Permission } from "../types/permission";

export const RoleEdit = ({ roleId }: { roleId?: string }) => {
  const { data, loading } = useQueries({
    queries: [roleOptions(roleId), usersOptions(), permissionQueryOptions()],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        loading: results.some((result) => result.isLoading),
      };
    },
  });

  const [role, users, permissions] = (data ?? []) as [
    Role,
    User[],
    Permission[],
  ];

  const userOptions =
    users?.map(({ username, id }: User) => ({
      label: username,
      value: id,
    })) ?? [];

  const permissionOptions =
    permissions?.map(({ key, id }: { key: string; id: number }) => ({
      label: key,
      value: id,
    })) ?? [];

  const { updateRoleAssociations } = useUpdateRole(Number(roleId));

  const form = useForm({
    defaultValues: {
      userIds: role?.users?.map(({ userId }) => userId) ?? [],
      permissionIds:
        role?.permissions?.map(({ permissionId }) => permissionId) ?? [],
    },
    onSubmit: async ({ value }) => {
      const {
        toAssociate: toAssociateUserIds,
        toDisassociate: toDisassociateUserIds,
      } = calculateDifference(
        role.users.map(({ userId }) => userId),
        value.userIds,
      );

      const {
        toAssociate: toAssociatePermissionIds,
        toDisassociate: toDisassociatePermissionIds,
      } = calculateDifference(
        role.permissions.map(({ permissionId }) => permissionId),
        value.permissionIds,
      );

      updateRoleAssociations({
        action: "associate",
        body: {
          userIds: Array.from(toAssociateUserIds),
          permissionIds: Array.from(toAssociatePermissionIds),
        },
      });

      updateRoleAssociations({
        action: "disassociate",
        body: {
          userIds: Array.from(toDisassociateUserIds),
          permissionIds: Array.from(toDisassociatePermissionIds),
        },
      });
    },
  });

  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue);

  if (loading || !role) {
    return <div className="p-4">Loading...</div>;
  }

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
                    // @ts-ignore: the multiselect is picky for no explainable reason.
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
                    // @ts-ignore: the multiselect is picky for no explainable reason.
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
};
