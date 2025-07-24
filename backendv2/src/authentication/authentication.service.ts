import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { UsersRepository } from "../users/users.repository";
import { JwtService } from "../jwt/jwt.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { err, ok } from "neverthrow";
import { verify } from "@node-rs/argon2";
import { SessionService } from "../session/session.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  async register(registrationData: CreateUserDto) {
    const user = await this.usersService.createUser(registrationData);

    return user;
  }

  async login(loginData: LoginUserDto) {
    const { email, password } = loginData;
    const userResult = await this.usersRepository.findByEmail(email);

    if (userResult.isErr() || !userResult.value) {
      return err("No user found!");
    }

    const { password: hashedPasword, id: userId } = userResult.value;

    const passwordsMatch = await verify(hashedPasword, password);

    if (!passwordsMatch) {
      return err("Invalid password");
    }

    const accessToken = await this.jwtService.signAccessToken({ sub: userId });

    if (!accessToken.isOk()) {
      return err("Could not generate accessToken");
    }

    const session = await this.sessionService.createSession(userId);

    if (!session.isOk()) {
      return err("Could not create session");
    }

    return ok({
      accessToken: accessToken.value,
      sessionToken: session.value.sessionToken,
    });
  }

  async profile(userId: number) {
    const userResult = await this.usersRepository.findById(userId);

    const userResultWithoutPassword = userResult.map(
      ({ password, ...restUser }) => restUser,
    );

    return userResultWithoutPassword;
  }
}
