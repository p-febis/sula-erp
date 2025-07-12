import { CreateUserDto, TUser } from "@/models/user";
import { PrismaClient } from "@/../generated/prisma";

export interface IUserRepository {
  create(
    userCreationData: CreateUserDto & { isSuperUser: boolean },
  ): Promise<TUser | null>;
  findByName(name: string): Promise<TUser | null>;
  findAll(): Promise<TUser[] | null>;
  refreshUser(id: number): Promise<TUser | null>;
  isFirstUser(): Promise<boolean>;
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

    return user;
  }

  async refreshUser(id: number) {
    const user = await this.client.user.update({
      where: { id },
      data: {
        refresh_token_version: {
          increment: 1,
        },
      },
    });

    return user;
  }

  async isFirstUser() {
    const count = await this.client.user.count();
    return count === 0;
  }

  async findAll() {
    const users = await this.client.user.findMany();
    return users;
  }
}
