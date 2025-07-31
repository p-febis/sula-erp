import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationService } from "./authentication.service";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { UsersService } from "../users/users.service";
import { err, ok } from "neverthrow";
import { UsersRepository } from "../users/users.repository";
import { JwtService } from "../jwt/jwt.service";
import { SessionService } from "../session/session.service";

describe("AuthenticationService", () => {
  let service: AuthenticationService;

  const mockUsersService = {
    createUser: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<UsersRepository>;

  const mockJwtService = {
    signAccessToken: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
  const mockSessionService = {
    createSession: jest.fn(),
  } as unknown as jest.Mocked<SessionService>;

  const sampleUser = {
    id: 1,
    isSuperUser: true,
    username: "john",
    password: "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
    email: "john@doeenterprises.com",
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Registration", () => {
    it("should register a user", async () => {
      const registrationData = {
        username: "john",
        email: "john@doeenterprises.com",
        password: "password",
      };

      mockUsersService.createUser.mockResolvedValueOnce(ok(sampleUser));

      const user = await service.register(registrationData);

      expect(mockUsersService.createUser).toHaveBeenCalledTimes(1);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        registrationData,
      );
      expect(user).toEqual(ok(sampleUser));
    });
  });

  describe("Login", () => {
    it("should return error if user not found", async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(ok(null));

      const loginResult = await service.login({
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        "john@doeenterprises.com",
      );

      expect(loginResult).toEqual(err("No user found!"));
    });

    it("should return an error if password is invalid", async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(ok(sampleUser));

      const loginResult = await service.login({
        email: "john@doeenterprises.com",
        password: "wrong-password",
      });

      expect(loginResult).toEqual(err("Invalid password"));
    });

    it("should return accessToken & session on success", async () => {
      const MOCK_ACCESS_TOKEN = "66516c23-82de-45f6-9eb6-33733e65de51";
      const MOCK_SESSION = {
        id: "aaaaa",
        userId: 1,
        secretHash: "bbbbb",
        sessionToken: "aaaaa.bbbbb",
      };
      mockUsersRepository.findByEmail.mockResolvedValueOnce(ok(sampleUser));
      mockJwtService.signAccessToken.mockResolvedValueOnce(
        ok(MOCK_ACCESS_TOKEN),
      );
      mockSessionService.createSession.mockResolvedValueOnce(ok(MOCK_SESSION));

      const loginResult = await service.login({
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(mockJwtService.signAccessToken).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAccessToken).toHaveBeenCalledWith({
        sub: 1,
        isSuperUser: true,
        permissions: [],
      });

      expect(mockSessionService.createSession).toHaveBeenCalledTimes(1);
      expect(mockSessionService.createSession).toHaveBeenCalledWith(1);

      expect(loginResult).toEqual(
        ok({
          accessToken: MOCK_ACCESS_TOKEN,
          sessionToken: MOCK_SESSION.sessionToken,
        }),
      );
    });
  });

  describe("Profile", () => {
    it("should return user profile", async () => {
      const MOCK_USER = {
        id: 1,
        username: "john",
        isSuperUser: true,
        email: "john@doeenterprises.com",
        password:
          "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
      };
      mockUsersRepository.findById.mockResolvedValueOnce(ok(MOCK_USER));

      const profileResult = await service.profile(1);

      expect(mockUsersRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);

      const { password, ...rest } = MOCK_USER;

      expect(profileResult).toEqual(ok(rest));
    });
  });
});
