import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { AuthorizationRepository } from "./authorization.repository";
import { ok } from "neverthrow";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  const mockAuthorizationRepository = {
    createRole: jest.fn(),
    findAllPermissionsForUser: jest.fn(),
  } as unknown as jest.Mocked<AuthorizationRepository>;

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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Creation", () => {
    it("should create a new role", async () => {
      const role = {
        name: "admin",
      };

      mockAuthorizationRepository.createRole.mockResolvedValue(
        ok({
          id: 1,
          name: "admin",
        }),
      );

      const createdRole = await service.createRole(role);

      expect(mockAuthorizationRepository.createRole).toHaveBeenCalledTimes(1);
      expect(mockAuthorizationRepository.createRole).toHaveBeenCalledWith(role);

      expect(createdRole).toEqual(
        ok({
          id: 1,
          name: "admin",
        }),
      );
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
      expect(
        mockAuthorizationRepository.findAllPermissionsForUser,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAuthorizationRepository.findAllPermissionsForUser,
      ).toHaveBeenCalledWith(1);

      expect(permissions).toEqual(mockResult);
    });
  });
});
