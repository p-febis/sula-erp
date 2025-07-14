import { CreateUserDto } from "@/models/user";

import { DB, User } from "@/db/db";
import { Kysely } from "kysely";
import { Selectable } from "kysely";


export interface IUserRepository {
  create(
    userCreationData: CreateUserDto & { is_super_user: boolean },
  ): Promise<Selectable<User> | null>;
  findByName(name: string): Promise<Selectable<User> | null>;
  findById(id: number): Promise<Selectable<User> | null>;
  findAll(): Promise<Omit<Selectable<User>, "password">[] | null>;
  isFirstUser(): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  client: Kysely<DB>;

  constructor(client: Kysely<DB>) {
    this.client = client;
  }

  async create(userCreationData: CreateUserDto & { is_super_user: boolean }) {
    const user =  await this.client.insertInto("user")
      .values(userCreationData)
      .returningAll()
      .executeTakeFirst() ?? null;

      return user;
 }

  async findByName(name: string) {
    const user = await this.client.selectFrom("user")
      .where("username", "=", name)
      .selectAll()
      .executeTakeFirst() ?? null;

    return user;
  }
  async findById(id: number) {
    const user = await this.client.selectFrom("user")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst() ?? null;

    return user;
  }

  async isFirstUser() {
    const count = await this.client.selectFrom("user")
	.select(({ fn }) => fn.count("id").as("count"))
	.executeTakeFirst()
	.then(result => result?.count);

    return count === 0;
  }

  async findAll() {
    const users = await this.client.selectFrom("user")
      .select(["user.id", "user.username", "user.refresh_token_version", "user.is_super_user"])
      .execute();
    return users;
  }
}
