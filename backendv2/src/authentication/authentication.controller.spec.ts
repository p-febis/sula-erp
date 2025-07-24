import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationController } from "./authentication.controller";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
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
    register: jest.fn(),
    login: jest.fn(),
    profile: jest.fn(),
  } as unknown as jest.Mocked<AuthenticationService>;

  const mockFastifyReply = {
    setCookie: jest.fn(),
  } as unknown as jest.Mocked<FastifyReply>;

  beforeEach(async () => {
    jest.resetAllMocks();
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("postRegister", () => {
    it("should call registerUser", async () => {
      const sampleUser = {
        id: 1,
        username: "john",
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

      expect(mockAuthenticationService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.register).toHaveBeenCalledWith({
        email: "john@doeenterprises.com",
        username: "john",
        password: "password",
      });

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({ statusCode: 201, data: null }),
      );
    });

    it("should throw error on failure", async () => {
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

      expect(mockAuthenticationService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.register).toHaveBeenCalledWith({
        email: "john@doeenterprises.com",
        username: "john",
        password: "password",
      });
    });
  });

  describe("postLogin", () => {
    it("should call loginUser", async () => {
      const sampleUser = {
        id: 1,
        username: "john",
        password:
          "$argon2id$v=19$m=16,t=2,p=1$c2xrZmpzYWY7$GzS30tw+ECXCE2+VatgR+g",
        email: "john@doeenterprises.com",
      };
      const MOCK_ACCESS_TOKEN = "ed962544-2f0c-4c74-8c71-75dc0f679756";
      const MOCK_SESSION_TOKEN = "f0e8b931-b7fd-4cb5-9912-c35f75fbc159";

      mockAuthenticationService.login.mockResolvedValueOnce(
        ok({
          accessToken: MOCK_ACCESS_TOKEN,
          sessionToken: MOCK_SESSION_TOKEN,
        }),
      );

      const result = await controller.postLogin(mockFastifyReply, {
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(mockAuthenticationService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith({
        email: "john@doeenterprises.com",
        password: "password",
      });

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 200,
          data: { accessToken: MOCK_ACCESS_TOKEN },
        }),
      );

      expect(mockFastifyReply.setCookie).toHaveBeenCalledTimes(1);
      expect(mockFastifyReply.setCookie).toHaveBeenCalledWith(
        "sessionToken",
        MOCK_SESSION_TOKEN,
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        },
      );
    });
    it("should throw error on failure", async () => {
      mockAuthenticationService.login.mockResolvedValueOnce(
        err("Invalid password"),
      );

      const error = await controller
        .postLogin(mockFastifyReply, {
          email: "john@doeenterprises.com",
          password: "password",
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(401);

      expect(mockAuthenticationService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.login).toHaveBeenCalledWith({
        email: "john@doeenterprises.com",
        password: "password",
      });
      expect(mockFastifyReply.setCookie).not.toHaveBeenCalled();
    });
  });

  describe("getProfile", () => {
    it("should call profileUser", async () => {
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

      expect(mockAuthenticationService.profile).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.profile).toHaveBeenCalledWith(1);

      expect(result).toBeInstanceOf(ApiResponse);
      expect(result).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleUser }),
      );
    });

    it("should throw error on failure", async () => {
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

      expect(mockAuthenticationService.profile).toHaveBeenCalledTimes(1);
      expect(mockAuthenticationService.profile).toHaveBeenCalledWith(1);
    });
  });
});
