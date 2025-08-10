import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { assertAuthorizationWithPermissions } from "../tests/helpers";
import { JwtService } from "../jwt/jwt.service";
import { err, ok } from "neverthrow";
import { ApiResponse } from "../api-response";
import { HttpException } from "@nestjs/common";

describe("UsersController", () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: vi.fn(),
  };

  const sampleUser = {
    id: 1,
    username: "john_doe",
    email: "john_doe@example.com",
    isSuperUser: true,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: null,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe("Finding", () => {
    it("should protect findAll", () => {
      assertAuthorizationWithPermissions(UsersController.prototype.findAll, [
        "read:user",
      ]);
    });

    it("should find all users", async () => {
      const sampleUsers = [sampleUser];

      mockUsersService.findAll.mockResolvedValueOnce(ok(sampleUsers));

      const usersResult = await controller.findAll();

      expect(usersResult).toBeInstanceOf(ApiResponse);
      expect(usersResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleUsers }),
      );
    });

    it("should return error if findAll fails", async () => {
      mockUsersService.findAll.mockResolvedValueOnce(err("Failed to select"));

      const usersResult = await controller.findAll().catch((e) => e);

      expect(usersResult).toBeInstanceOf(HttpException);
      expect(usersResult.getStatus()).toBe(500);
    });
  });
});
