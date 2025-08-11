import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationRepository } from "./authorization.repository";
import { ok } from "neverthrow";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  const mockAuthorizationRepository = {
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
