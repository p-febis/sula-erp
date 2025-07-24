import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";
import { hash } from "@node-rs/argon2";
import { err } from "neverthrow";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

    const newUser = await this.usersRepository.create({
      password: passwordHash,
      ...restCreationData,
    });

    return newUser;
  }
}
