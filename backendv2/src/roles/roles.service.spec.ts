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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Creating", () => {
    it("should return a new role", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesRepository.create.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await service.create({
        name: "Admin",
      });

      expect(mockRolesRepository.create).toHaveBeenCalledExactlyOnceWith({
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

      mockRolesRepository.findAll.mockResolvedValueOnce(ok(sampleRoles));

      const rolesResult = await service.findAll();

      expect(mockRolesRepository.findAll).toHaveBeenCalledExactlyOnceWith();
      expect(rolesResult).toEqual(ok(sampleRoles));
    });

    it("should return a role", async () => {
      const sampleRole = {
        id: 1,
        name: "Admin",
      };

      mockRolesRepository.findOne.mockResolvedValueOnce(ok(sampleRole));

      const roleResult = await service.findOne(1);

      expect(mockRolesRepository.findOne).toHaveBeenCalledExactlyOnceWith(1);

      expect(roleResult).toEqual(ok(sampleRole));
    });
  });

  describe("Updating", () => {
    it("should return a role", async () => {
      const sampleRole = {
        id: 1,
        name: "Manager",
      };

      mockRolesRepository.updateOne.mockResolvedValueOnce(ok(sampleRole));

      const role = await service.updateOne(1, {
        name: "Manager",
      });

      expect(mockRolesRepository.updateOne).toHaveBeenCalledExactlyOnceWith(1, {
        name: "Manager",
      });

      expect(role).toEqual(ok(sampleRole));
    });
  });

  describe("Deletion", () => {
    it("should delete a role", async () => {
      const sampleRole = {
        id: 1,
        name: "Manager",
      };

      mockRolesRepository.deleteOne.mockResolvedValueOnce(ok(sampleRole));

      const role = await service.deleteOne(1);

      expect(mockRolesRepository.deleteOne).toHaveBeenCalledExactlyOnceWith(1);

      expect(role).toEqual(ok(sampleRole));
    });
  });
});
