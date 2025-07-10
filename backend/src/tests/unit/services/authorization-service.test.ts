import {
  AuthorizationService,
  IAuthorizationService,
} from "@/services/AuthorizationService";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AuthorizationService", () => {
  let authorizationService: IAuthorizationService;

  let mockAuthorizationRepository = {
    createRole: vi.fn(),
    findAllRoles: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    authorizationService = new AuthorizationService(
      mockAuthorizationRepository,
    );
  });

  const roleData = {
    name: "Marketing",
    userIds: [],
    permissionIds: [],
  };

  const fullRole = {
    id: 1,
    name: "Marketing",
    users: [],
    permissions: [],
  };

  it("Should create a role", async () => {
    mockAuthorizationRepository.createRole.mockResolvedValueOnce(fullRole);

    const role = await authorizationService.createRole(roleData);
    expect(
      mockAuthorizationRepository.createRole,
    ).toHaveBeenCalledExactlyOnceWith({
      name: "Marketing",
      userIds: [],
      permissionIds: [],
    });

    expect(role).toEqual(fullRole);
  });

  it("Should return all roles", async () => {
    const allRoles = [fullRole];

    mockAuthorizationRepository.findAllRoles.mockResolvedValueOnce(allRoles);
    const result = await authorizationService.allRoles();

    expect(mockAuthorizationRepository.findAllRoles).toHaveBeenCalledOnce();
    expect(result).toEqual(allRoles);
  });
});
