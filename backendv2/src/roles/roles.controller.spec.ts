import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { RolesRepository } from "./roles.repository";
import { AuthenticationGuard } from "../authentication/authentication.guard";
import { JwtService } from "../jwt/jwt.service";
import { assertAuthorizationWithPermissions } from "../tests/helpers";
import { err, ok } from "neverthrow";
import { ApiResponse } from "../api-response";
import { HttpException } from "@nestjs/common";

describe("RolesController", () => {
  let controller: RolesController;

  const mockRolesService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: RolesRepository,
          useValue: null,
        },
        {
          provide: JwtService,
          useValue: null,
        },
        {
          provide: AuthenticationGuard,
          useValue: {
            canActivate: vi.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("Creating", () => {
    it("should be protected", async () => {
      assertAuthorizationWithPermissions(RolesController.prototype.create, [
        "create:role",
      ]);
    });

    it("should create a role with valid data", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesService.create.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await controller.create({
        name: "Admin",
      });

      expect(mockRolesService.create).toHaveBeenCalledExactlyOnceWith({
        name: "Admin",
      });

      expect(roleResult).toBeInstanceOf(ApiResponse);
      expect(roleResult).toEqual(
        expect.objectContaining({ statusCode: 201, data: sampleRole }),
      );
    });

    it("should throw error on failure", async () => {
      mockRolesService.create.mockResolvedValueOnce(err("Failed to insert"));

      const error = await controller
        .create({
          name: "Admin",
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(500);
    });
  });

  describe("Finding", () => {
    it("should protect findAll", async () => {
      assertAuthorizationWithPermissions(RolesController.prototype.findAll, [
        "read:role",
      ]);
    });

    it("should find all roles", async () => {
      const sampleRoles = [
        {
          id: 1,
          name: "Admin",
        },
        {
          id: 2,
          name: "Manager",
        },
        {
          id: 3,
          name: "Employee",
        },
      ];

      mockRolesService.findAll.mockResolvedValueOnce(ok(sampleRoles));

      const rolesResult = await controller.findAll();

      expect(mockRolesService.findAll).toHaveBeenCalledExactlyOnceWith();
      expect(rolesResult).toBeInstanceOf(ApiResponse);
      expect(rolesResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleRoles }),
      );
    });

    it("should return error if findAll fails", async () => {
      mockRolesService.findAll.mockResolvedValueOnce(err("Failed to select"));

      const rolesResult = await controller.findAll().catch((e) => e);

      expect(mockRolesService.findAll).toHaveBeenCalledOnce();
      expect(rolesResult).toBeInstanceOf(HttpException);
      expect(rolesResult.getStatus()).toBe(500);
    });

    it("should protect findOne", async () => {
      assertAuthorizationWithPermissions(RolesController.prototype.findOne, [
        "read:role",
      ]);
    });

    it("should find a role by id", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesService.findOne.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await controller.findOne("1");

      expect(mockRolesService.findOne).toHaveBeenCalledExactlyOnceWith(1);

      expect(roleResult).toBeInstanceOf(ApiResponse);
      expect(roleResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleRole }),
      );
    });

    it("should return error if findOne fails", async () => {
      mockRolesService.findOne.mockResolvedValueOnce(err("Failed to select"));

      const roleResult = await controller.findOne("1").catch((e) => e);

      expect(mockRolesService.findOne).toHaveBeenCalledExactlyOnceWith(1);
      expect(roleResult).toBeInstanceOf(HttpException);
      expect(roleResult.getStatus()).toBe(500);
    });
  });

  describe("Updating", () => {
    it("should protect updateOne", async () => {
      assertAuthorizationWithPermissions(RolesController.prototype.updateOne, [
        "update:role",
      ]);
    });

    it("should update a role by id", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesService.updateOne.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await controller.updateOne("1", {
        name: "Admin",
      });

      expect(mockRolesService.updateOne).toHaveBeenCalledExactlyOnceWith(1, {
        name: "Admin",
      });

      expect(roleResult).toBeInstanceOf(ApiResponse);
      expect(roleResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleRole }),
      );
    });

    it("should return error if updateOne fails", async () => {
      mockRolesService.updateOne.mockResolvedValueOnce(err("Failed to update"));

      const roleResult = await controller
        .updateOne("1", {
          name: "Admin",
        })
        .catch((e) => e);

      expect(mockRolesService.updateOne).toHaveBeenCalledExactlyOnceWith(1, {
        name: "Admin",
      });
      expect(roleResult).toBeInstanceOf(HttpException);
      expect(roleResult.getStatus()).toBe(500);
    });
  });

  describe("Deleting", () => {
    it("should protect deleteOne", async () => {
      assertAuthorizationWithPermissions(RolesController.prototype.deleteOne, [
        "delete:role",
      ]);
    });

    it("should delete a role by id", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesService.deleteOne.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await controller.deleteOne("1");

      expect(mockRolesService.deleteOne).toHaveBeenCalledExactlyOnceWith(1);

      expect(roleResult).toBeInstanceOf(ApiResponse);
      expect(roleResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleRole }),
      );
    });

    it("should return error if deleteOne fails", async () => {
      mockRolesService.deleteOne.mockResolvedValueOnce(err("Failed to delete"));

      const roleResult = await controller.deleteOne("1").catch((e) => e);

      expect(mockRolesService.deleteOne).toHaveBeenCalledExactlyOnceWith(1);
      expect(roleResult).toBeInstanceOf(HttpException);
      expect(roleResult.getStatus()).toBe(500);
    });
  });
});
