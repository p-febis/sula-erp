import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { RolesService } from "./roles.service";
import { RolesRepository } from "./roles.repository";
import { ok } from "neverthrow";

describe("RolesService", () => {
  let service: RolesService;

  const mockRolesRepository = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
    createAssociations: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  const sampleRole = {
    id: 1,
    name: "Admin",
    users: [
      {
        id: 1,
        username: "Admin",
      },
    ],
    permissions: ["create:something"],
  };

  describe("Creating", () => {
    it("should return a new role", async () => {
      mockRolesRepository.create.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await service.create({
        name: "Admin",
      });

      expect(roleResult).toEqual(ok(sampleRole));
    });
  });

  describe("Finding", () => {
    it("should return an array of roles", async () => {
      const sampleRoles = [
        {
          id: 1,
          name: "Administrator",
        },
      ];
      mockRolesRepository.findAll.mockResolvedValueOnce(ok(sampleRoles));

      const rolesResult = await service.findAll();

      expect(rolesResult).toEqual(ok(sampleRoles));
    });

    it("should return a role", async () => {
      mockRolesRepository.findOne.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await service.findOne(1);

      expect(roleResult).toEqual(ok(sampleRole));
    });
  });

  describe("Updating", () => {
    it("should return a role", async () => {
      mockRolesRepository.updateOne.mockResolvedValueOnce(ok(sampleRole));

      const role = await service.updateOne(1, {
        name: "Admin",
      });

      expect(role).toEqual(ok(sampleRole));
    });
  });

  describe("Deletion", () => {
    it("should delete a role", async () => {
      mockRolesRepository.deleteOne.mockResolvedValueOnce(ok(sampleRole));

      const role = await service.deleteOne(1);

      expect(role).toEqual(ok(sampleRole));
    });
  });

  describe("Associations", () => {
    it("should be able to associate users & permissions", async () => {
      mockRolesRepository.createAssociations.mockResolvedValueOnce(ok());

      await expect(
        service.createAssociations(1, {
          userIds: [1],
          permissionIds: [2],
        }),
      ).resolves.toEqual(ok());
    });

    it.todo("should be able to disassociate users & permissions");
  });
});
