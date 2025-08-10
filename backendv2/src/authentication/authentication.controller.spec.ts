import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationController } from "./authentication.controller";
import { err, ok } from "neverthrow";
import { AuthenticationService } from "./authentication.service";
import { ApiResponse } from "../api-response";
import { HttpException } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationGuard } from "./authentication.guard";
import { JwtService } from "../jwt/jwt.service";

describe("AuthenticationController", () => {
  let controller: AuthenticationController;

  const mockAuthenticationService = {
    register: vi.fn(),
    login: vi.fn(),
    profile: vi.fn(),
    refresh: vi.fn(),
  };

  const mockFastifyReply = {
    setCookie: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: JwtService,
          useValue: null,
        },
        {
          provide: AuthenticationGuard,
          useValue: null,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  describe("Register", () => {
    it("should be able to register a user", async () => {
      const sampleUser = {
        id: 1,
        username: "john",
        isSuperUser: true,
        password:
          "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
        email: "john@doeenterprises.com",
      };

      mockAuthenticationService.register.mockResolvedValueOnce(ok(sampleUser));

      const result = await controller.postRegister({
        email: "john@doeenterprises.com",
        username: "john",
        password: "password",
      });

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({ statusCode: 201, data: null }),
      );
    });

    it("should throw an error on failure to register", async () => {
      mockAuthenticationService.register.mockResolvedValueOnce(
        err("User already exists"),
      );

      const error = await controller
        .postRegister({
          email: "john@doeenterprises.com",
          username: "john",
          password: "password",
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
    });
  });

  describe("Login", () => {
    it("should be able to login a user", async () => {
      const MOCK_ACCESS_TOKEN = "ed962544-2f0c-4c74-8c71-75dc0f679756";
      const MOCK_SESSION_TOKEN = "f0e8b931-b7fd-4cb5-9912-c35f75fbc159";

      mockAuthenticationService.login.mockResolvedValueOnce(
        ok({
          accessToken: MOCK_ACCESS_TOKEN,
          sessionToken: MOCK_SESSION_TOKEN,
        }),
      );

      const result = await controller.postLogin(
        mockFastifyReply as unknown as FastifyReply,
        {
          email: "john@doeenterprises.com",
          password: "password",
        },
      );

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 200,
          data: { accessToken: MOCK_ACCESS_TOKEN },
        }),
      );

      expect(mockFastifyReply.setCookie).toHaveBeenCalledExactlyOnceWith(
        "sessionToken",
        MOCK_SESSION_TOKEN,
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        },
      );
    });

    it("should throw an error on failure", async () => {
      mockAuthenticationService.login.mockResolvedValueOnce(
        err("Invalid password"),
      );

      const error = await controller
        .postLogin(mockFastifyReply as unknown as FastifyReply, {
          email: "john@doeenterprises.com",
          password: "password",
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(401);
    });
  });

  describe("Profile", () => {
    it("should be able to get the user's profile", async () => {
      const sampleUser = {
        id: 1,
        username: "john",
        email: "john@doeenterprises.com",
      };

      mockAuthenticationService.profile.mockResolvedValueOnce(ok(sampleUser));

      const mockRequest = {
        user: {
          sub: 1,
        },
      };

      const result = await controller.getProfile(
        mockRequest as unknown as FastifyRequest,
      );

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleUser }),
      );
    });

    it("should throw an error on failure to retrieve profile", async () => {
      const mockRequest = {
        user: {
          sub: 1,
        },
      };

      mockAuthenticationService.profile.mockResolvedValueOnce(
        err("Failed to select"),
      );

      const error = await controller
        .getProfile(mockRequest as unknown as FastifyRequest)
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(500);
    });
  });

  describe("[POST] Refresh", () => {
    it("should be able to refresh a user's tokens", async () => {
      const mockRequest = {
        cookies: {
          sessionToken: "79382d6f-a7b7-42e4-996a-b38e133b9c19",
        },
      };

      const mockResponse = {
        setCookie: vi.fn(),
      };

      mockAuthenticationService.refresh.mockResolvedValueOnce(
        ok({
          accessToken: "66516c23-82de-45f6-9eb6-33733e65de51",
          sessionToken: "79382d6f-a7b7-42e4-996a-b38e133b9c19",
        }),
      );

      const response = await controller.postRefresh(
        mockRequest as unknown as FastifyRequest,
        mockResponse as unknown as FastifyReply,
      );

      expect(response).toBeInstanceOf(ApiResponse);
      expect(response).toEqual(
        expect.objectContaining({
          statusCode: 200,
          data: {
            accessToken: "66516c23-82de-45f6-9eb6-33733e65de51",
          },
        }),
      );

      expect(mockResponse.setCookie).toHaveBeenCalledExactlyOnceWith(
        "sessionToken",
        "79382d6f-a7b7-42e4-996a-b38e133b9c19",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }),
      );
    });

    it("should throw an error on failure to refresh", async () => {
      const mockRequest = {
        cookies: {
          sessionToken: "79382d6f-a7b7-42e4-996a-b38e133b9c19",
        },
      };

      const mockResponse = {
        setCookie: vi.fn(),
      };

      mockAuthenticationService.refresh.mockResolvedValueOnce(
        err("Invalid session token"),
      );

      const error = await controller
        .postRefresh(
          mockRequest as unknown as FastifyRequest,
          mockResponse as unknown as FastifyReply,
        )
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(401);
    });
  });
});
