import { CreateUserDto, TUser } from "@/models/user";

export interface IUserRepository {
  create(userCreationData: CreateUserDto): Promise<TUser>;
}
