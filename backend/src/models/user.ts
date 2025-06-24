import { z } from "zod/v4";

export const CreateUserDtoSchema = z.object({
  password: z.string(),
  username: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const LoginUserDtoSchema = z.object({
  password: z.string(),
  username: z.string(),
});

export type LoginUserDto = z.infer<typeof CreateUserDtoSchema>;

export type TUser = {
  id: number;
  refresh_token_version: number;
  username: string;
  password: string;
};
