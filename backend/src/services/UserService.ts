import { CreateUserDto, LoginUserDto, TUser } from "@/models/user";
import { IUserRepository } from "@/repositories/UserRepository";
import { hashingOptions } from "@/utils/argon-options";
import { hash, verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";

export interface IUserService {
  createUser(userCreationData: CreateUserDto): Promise<TUser>;
  loginUser(
    loginData: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshUser(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>; 
}

export class UserService implements IUserService {
  m_userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.m_userRepository = userRepository;
  }

  async createUser(userCreationData: CreateUserDto): Promise<TUser> {
    const user = await this.m_userRepository.create({
      ...userCreationData,
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

    const { accessToken, refreshToken } = this.createTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  createTokens(user: TUser) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
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
    ) as unknown as { payload: { sub: number; } };

    const user = await this.m_userRepository.refreshUser(payload.sub);

    if(!user) {
	throw "User does not exist!";
    }

    const { accessToken, refreshToken } = this.createTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
