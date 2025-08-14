import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationService } from "./authentication.service";
import { UsersService } from "../users/users.service";
import { err, ok } from "neverthrow";
import { UsersRepository } from "../users/users.repository";
import { JwtService } from "../jwt/jwt.service";
import { SessionService } from "../session/session.service";
import { AuthorizationService } from "../authorization/authorization.service";

describe("AuthenticationService", () => {
  let service: AuthenticationService;

  const mockUsersService = {
    createUser: vi.fn(),
  };

  const mockUsersRepository = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };

  const mockJwtService = {
    signAccessToken: vi.fn(),
  };

  const mockSessionService = {
    createSession: vi.fn(),
    verifySession: vi.fn(),
  };

  const mockAuthorizationService = {
    findUserPermissions: vi.fn(),
  };

  const sampleUser = {
    id: 1,
    isSuperUser: true,
    username: "john",
    password: "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
    email: "john@doeenterprises.com",
  };

  beforeEach(async () => {
    vi.resetAllMocks();
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
        {
          provide: AuthorizationService,
          useValue: mockAuthorizationService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  describe("Registration", () => {
    it("should be able to register a user", async () => {
      const registrationData = {
        username: "john",
        email: "john@doeenterprises.com",
        password: "password",
      };

      mockUsersService.createUser.mockResolvedValueOnce(ok(sampleUser));

      const user = await service.register(registrationData);

      expect(user).toEqual(ok(sampleUser));
    });
  });

  describe("Login", () => {
    it("should return an error if user not found", async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(ok(null));
      mockAuthorizationService.findUserPermissions.mockResolvedValueOnce(
        ok([]),
      );

      const loginResult = await service.login({
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(loginResult).toEqual(err("No user found!"));
    });

    it("should return an error if password is invalid", async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(ok(sampleUser));
      mockAuthorizationService.findUserPermissions.mockResolvedValueOnce(
        ok([]),
      );

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
      mockAuthorizationService.findUserPermissions.mockResolvedValueOnce(
        ok([]),
      );
      mockJwtService.signAccessToken.mockResolvedValueOnce(
        ok(MOCK_ACCESS_TOKEN),
      );
      mockSessionService.createSession.mockResolvedValueOnce(ok(MOCK_SESSION));

      const loginResult = await service.login({
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(loginResult).toEqual(
        ok({
          accessToken: MOCK_ACCESS_TOKEN,
          sessionToken: MOCK_SESSION.sessionToken,
        }),
      );
    });
  });

  describe("Profile", () => {
    it("should return user profile with permissions", async () => {
      const MOCK_USER = {
        id: 1,
        username: "john",
        isSuperUser: true,
        email: "john@doeenterprises.com",
        password:
          "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
      };

      mockUsersRepository.findById.mockResolvedValueOnce(ok(MOCK_USER));
      mockAuthorizationService.findUserPermissions.mockResolvedValueOnce(
        ok(["read:something", "write:something"]),
      );

      const profileResult = await service.profile(1);

      const { password, ...rest } = MOCK_USER;

      expect(profileResult).toEqual(
        ok({
          ...rest,
          permissions: ["read:something", "write:something"],
        }),
      );
    });
  });

  describe("Refresh", () => {
    it("should return error if session not found", async () => {
      mockSessionService.verifySession.mockResolvedValueOnce(
        err("Invalid session token"),
      );

      const refreshResult = await service.refresh("invalid-session-token");

      expect(mockSessionService.verifySession).toHaveBeenCalledExactlyOnceWith(
        "invalid-session-token",
      );

      expect(refreshResult).toEqual(err("Invalid session token"));
    });

    it("should verify a session and return a new accessToken", async () => {
      const MOCK_ACCESS_TOKEN = "66516c23-82de-45f6-9eb6-33733e65de51";
      const MOCK_SESSION = {
        id: "aaaaa",
        userId: 1,
        secretHash: "bbbbb",
        sessionToken: "aaaaa.bbbbb",
      };

      mockSessionService.verifySession.mockResolvedValueOnce(ok(MOCK_SESSION));
      mockSessionService.createSession.mockResolvedValueOnce(ok(MOCK_SESSION));
      mockAuthorizationService.findUserPermissions.mockResolvedValueOnce(
        ok([]),
      );
      mockJwtService.signAccessToken.mockResolvedValueOnce(
        ok(MOCK_ACCESS_TOKEN),
      );
      mockUsersRepository.findById.mockResolvedValueOnce(ok(sampleUser));

      const refreshResult = await service.refresh(
        "79382d6f-a7b7-42e4-996a-b38e133b9c19",
      );

      expect(refreshResult).toEqual(
        ok({
          accessToken: MOCK_ACCESS_TOKEN,
          sessionToken: MOCK_SESSION.sessionToken,
        }),
      );
    });
  });
});
