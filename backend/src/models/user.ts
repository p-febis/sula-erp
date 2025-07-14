import { z } from "zod/v4";

export const CreateUserDtoSchema = z.object({
  password: z.string().min(8),
  username: z.string().min(4),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const LoginUserDtoSchema = z.object({
  password: z.string().min(8),
  username: z.string().min(4),
});

export type LoginUserDto = z.infer<typeof CreateUserDtoSchema>;
