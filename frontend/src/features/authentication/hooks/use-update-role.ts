import { mutationOptions, useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";

type UpdateRoleAssociationsBody = {
  permissionIds: number[];
  userIds: number[];
};

type UpdateRoleAssociationsAction = "associate" | "disassociate";

export const roleOptions = (roleId: number) => {
  return mutationOptions({
    mutationFn: async ({
      action,
      body,
    }: {
      action: UpdateRoleAssociationsAction;
      body: UpdateRoleAssociationsBody;
    }) => {
      const method = action === "associate" ? "PATCH" : "DELETE";
      const response = await fetchWithAuth(
        `/api/roles/${roleId}/associations`,
        {
          method,
          body: JSON.stringify(body),
        },
      );

      const json = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(json));
      return json.data;
    },
  });
};

export const useUpdateRole = (roleId: number) => {
  const { mutate, ...restMutation } = useMutation(roleOptions(roleId));

  return {
    updateRoleAssociations: mutate,
    ...restMutation,
  };
};
