import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { UsersRepository } from "../users/users.repository";
import { JwtService } from "../jwt/jwt.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { err, ok } from "neverthrow";
import { verify } from "@node-rs/argon2";
import { SessionService } from "../session/session.service";
import { AuthorizationService } from "../authorization/authorization.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly authorizationService: AuthorizationService,
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

    // TODO: Permissions should be fetched from the database
    const accessToken = await this.jwtService.signAccessToken({
      sub: userId,
      isSuperUser: userResult.value.isSuperUser,
      permissions: [],
    });

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
    const [userResult, authenticationResult] = await Promise.all([
      this.usersRepository.findById(userId),
      this.authorizationService.findUserPermissions(userId),
    ]);

    if (userResult.isErr() || authenticationResult.isErr()) {
      return err("Failed to get profile");
    }

    const { password, ...userResultWithoutPassword } = userResult.value;
    return ok({
      ...userResultWithoutPassword,
      permissions: authenticationResult.value,
    });
  }

  async refresh(sessionToken: string) {
    const sessionResult = await this.sessionService.verifySession(sessionToken);

    if (sessionResult.isErr()) return sessionResult;

    const userResult = await this.usersRepository.findById(
      sessionResult.value.userId,
    );

    if (userResult.isErr()) return err("Failed to get user");

    const session = await this.sessionService.createSession(
      userResult.value.id,
    );

    // TODO: Permissions should be fetched from the database
    const accessToken = await this.jwtService.signAccessToken({
      sub: userResult.value.id,
      isSuperUser: userResult.value.isSuperUser,
      permissions: [],
    });

    if (!accessToken.isOk()) return err("Could not generate accessToken");
    if (!session.isOk()) return err("Could not create session");

    return ok({
      accessToken: accessToken.value,
      sessionToken: session.value.sessionToken,
    });
  }
}
