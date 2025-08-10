import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";
import { assertAuthorizationWithPermissions } from "../tests/helpers";
import { JwtService } from "../jwt/jwt.service";
import { err, ok } from "neverthrow";
import { ApiResponse } from "../api-response";
import { HttpException } from "@nestjs/common";

describe("PermissionsController", () => {
  let controller: PermissionsController;

  const mockPermissionsService = {
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
        {
          provide: JwtService,
          useValue: null,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("Finding", () => {
    it("should protect findAll", () => {
      assertAuthorizationWithPermissions(
        PermissionsController.prototype.findAll,
        ["read:permission"],
      );
    });

    it("should find all permissions", async () => {
      const samplePermissions = [
        {
          id: 1,
          name: "create:something",
        },
        {
          id: 2,
          name: "read:something",
        },
      ];

      mockPermissionsService.findAll.mockResolvedValueOnce(
        ok(samplePermissions),
      );

      const permissionsResult = await controller.findAll();

      expect(permissionsResult).toBeInstanceOf(ApiResponse);
      expect(permissionsResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: samplePermissions }),
      );
    });

    it("should return error if findAll fails", async () => {
      mockPermissionsService.findAll.mockResolvedValueOnce(
        err("Failed to select"),
      );

      const permissionsResult = await controller.findAll().catch((e) => e);

      expect(permissionsResult).toBeInstanceOf(HttpException);
      expect(permissionsResult.getStatus()).toBe(500);
    });
  });
});
