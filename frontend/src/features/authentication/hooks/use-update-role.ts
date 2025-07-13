import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";

type UpdateRoleAssociationsBody = {
  permissionIds: number[];
  userIds: number[];
};

type UpdateRoleAssociationsAction = "associate" | "disassociate";

export const useUpdateRole = (roleId: number) => {
  const { mutate, ...restMutation } = useMutation({
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

  return {
    updateRoleAssociations: mutate,
    ...restMutation,
  };
};
