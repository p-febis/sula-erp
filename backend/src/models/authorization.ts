import { z } from "zod/v4";

export const CreateRoleDtoSchema = z.object({
  name: z.string(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleDtoSchema>;

export const UpdateRoleDtoSchema = z.object({
  userIds: z.number().array(),
  permissionIds: z.number().array(),
});
export type UpdateRoleDto = z.infer<typeof UpdateRoleDtoSchema>;

export const DeleteAssociationsFromRoleDtoSchema = UpdateRoleDtoSchema;
export type DeleteAssociationsFromRoleDto = z.infer<typeof DeleteAssociationsFromRoleDtoSchema>;
