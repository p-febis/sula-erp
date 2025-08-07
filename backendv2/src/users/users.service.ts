import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersRepository, type TUser } from "./users.repository";
import { hash } from "@node-rs/argon2";
import { err } from "neverthrow";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    const usersResult = await this.usersRepository.findAll();
    return usersResult.map((users: TUser[]) =>
      users.map(({ password, ...restUser }) => restUser),
    );
  }

  async createUser(creationData: CreateUserDto) {
    const userResult = await this.usersRepository.findByEmail(
      creationData.email,
    );

    if (userResult.isOk() && userResult.value) {
      return err("User already exists");
    }

    const { password, ...restCreationData } = creationData;

    // TODO: Maybe catch an error here?
    const passwordHash = await hash(password);

    const isSuperUser = await this.usersRepository.isFirstUser();

    if (isSuperUser.isErr()) {
      return err("Failed to check if first user");
    }

    const newUser = await this.usersRepository.create({
      isSuperUser: isSuperUser.value,
      password: passwordHash,
      ...restCreationData,
    });

    return newUser;
  }
}
