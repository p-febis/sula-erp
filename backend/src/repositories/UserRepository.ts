import { CreateUserDto, TUser } from "@/models/user";
import { PrismaClient } from "@/../generated/prisma";

export interface IUserRepository {
  create(userCreationData: CreateUserDto): Promise<TUser | null>;
  findByName(name: string): Promise<TUser | null>;
}

export class UserRepository implements IUserRepository {
  client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  async create(userCreationData: CreateUserDto) {
    return this.client.user.create({
      data: {
        ...userCreationData,
        refresh_token_version: 1,
      },
    });
  }

  async findByName(name: string) {
    const user = await this.client.user.findUnique({
      where: {
        username: name,
      },
    });

    if (!user) {
      throw "No user!";
    }

    return user;
  }
}
