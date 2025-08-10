import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationRepository } from "./authorization.repository";
import { ok } from "neverthrow";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  const fullRole = {
    id: 1,
    name: "Marketing",
    users: [],
    permissions: [],
  };

  const mockAuthorizationRepository = {
    createRole: vi.fn(),
    createRoleAssociations: vi.fn(),
    findAllPermissionsForUser: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: AuthorizationRepository,
          useValue: mockAuthorizationRepository,
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  describe("Roles > Creation", () => {
    it("should create a new role", async () => {
      const role = {
        name: "admin",
      };

      mockAuthorizationRepository.createRole.mockResolvedValue(ok(fullRole));
      const createdRole = await service.createRole(role);

      expect(createdRole).toEqual(ok(fullRole));
    });
  });

  describe("Permissions", () => {
    it("should return all permissions for a user", async () => {
      const mockResult = ok([
        "read:something",
        "create:something",
        "update:something",
        "delete:something",
      ]);

      mockAuthorizationRepository.findAllPermissionsForUser.mockResolvedValue(
        mockResult,
      );

      const permissions = await service.findUserPermissions(1);

      expect(permissions).toEqual(mockResult);
    });
  });
});
