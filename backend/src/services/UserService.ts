import { User } from "@/db/db";
import { CreateUserDto, LoginUserDto } from "@/models/user";
import { IAuthorizationRepository } from "@/repositories/AuthorizationRepository";
import { IUserRepository } from "@/repositories/UserRepository";
import { hashingOptions } from "@/utils/argon-options";
import { hash, verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import { Selectable } from "kysely";

export interface IUserService {
  createUser(userCreationData: CreateUserDto): Promise<Selectable<User>>;
  findAllUsers(): Promise<Omit<Selectable<User>, "password">[] | null>;
  loginUser(
    loginData: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshUser(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export class UserService implements IUserService {
  m_userRepository: IUserRepository;
  m_authorizationRepository: IAuthorizationRepository;

  constructor(
    userRepository: IUserRepository,
    authorizationRepository: IAuthorizationRepository,
  ) {
    this.m_userRepository = userRepository;
    this.m_authorizationRepository = authorizationRepository;
  }

  async createUser(userCreationData: CreateUserDto) {
    const is_super_user = await this.m_userRepository.isFirstUser();

    const user = await this.m_userRepository.create({
      ...userCreationData,
      is_super_user ,
      password: await hash(userCreationData.password, hashingOptions),
    });

    if (!user) {
      throw "This user already exists!";
    }

    return user;
  }

  async loginUser({
    username,
    password,
  }: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.m_userRepository.findByName(username);
    if (!user) {
      throw "No user!";
    }

    const passwordsMatch = await verify(user.password, password);

    if (!passwordsMatch) {
      throw "Passwords don't match!";
    }

    const permissions = await this.m_authorizationRepository.getUserPermissions(
      user.id,
    );

    const { accessToken, refreshToken } = this.createTokens(user, permissions);

    return {
      accessToken,
      refreshToken,
    };
  }

  createTokens(user: Selectable<User>, permissions: string[]) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        authorization: {
          is_super_user: user.is_super_user,
          permissions,
        },
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15min",
      },
    );

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        refresh_token_version: user.refresh_token_version,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      },
    );

    return { accessToken, refreshToken };
  }

  async refreshUser(oldRefreshToken: string) {
    const { payload } = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as { payload: { sub: number } };

    const user = await this.m_userRepository.findById(payload.sub);
    if (!user) {
      throw "User does not exist!";
    }

    const permissions = await this.m_authorizationRepository.getUserPermissions(
      user.id,
    );

    const { accessToken, refreshToken } = this.createTokens(user, permissions);

    return {
      accessToken,
      refreshToken,
    };
  }

  async findAllUsers() {
    const users = await this.m_userRepository.findAll();
    return users;
  }
}
