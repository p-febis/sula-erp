import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { PermissionsService } from "./permissions.service";
import { PermissionsRepository } from "./permissions.repository";
import { ok } from "neverthrow";

describe("PermissionsService", () => {
  let service: PermissionsService;

  const mockPermissionsRepository = {
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionsRepository,
          useValue: mockPermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Finding", () => {
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

      mockPermissionsRepository.findAll.mockResolvedValueOnce(
        ok(samplePermissions),
      );

      const permissionsResult = await service.findAll();

      expect(mockPermissionsRepository.findAll).toHaveBeenCalledOnce();
      expect(permissionsResult).toEqual(ok(samplePermissions));
    });
  });
});
