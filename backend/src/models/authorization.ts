import { z } from "zod/v4";

export const CreateRoleDtoSchema = z.object({
  name: z.string(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleDtoSchema>;
