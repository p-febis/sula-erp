import { z } from "zod/v4";

export const CreateUserDtoSchema = z.object({
  password: z.string(),
  username: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
export type TUser = {};
