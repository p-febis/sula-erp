import { User } from "@/db/db";
import { Selectable } from "kysely";
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

export type UserIdentity = {
  user: Omit<Selectable<User>, "password" | "refresh_token_version">;
  permissions: string[];
};
