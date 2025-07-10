import { z } from "zod/v4";

export const CreateRoleDtoSchema = z.object({
  name: z.string(),
  userIds: z.array(z.number()),
  permissionIds: z.array(z.number()),
});

export type CreateRoleDto = z.infer<typeof CreateRoleDtoSchema>;
