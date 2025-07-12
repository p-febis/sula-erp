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
    updateRole: vi.fn(),
    findRoleById: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    authorizationService = new AuthorizationService(
      mockAuthorizationRepository,
    );
  });

  const roleData = {
    name: "Marketing",
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

  it("Should return true on valid permissions", () => {
    const canDo = authorizationService.userCanDo(
      {
        isSuperUser: true,
        permissions: [],
      },
      ["create:something"],
    );

    expect(canDo).toBeTruthy();

    const canDo2 = authorizationService.userCanDo(
      {
        isSuperUser: false,
        permissions: ["create:something"],
      },
      ["create:something"],
    );

    expect(canDo2).toBeTruthy();
  });

  it("Should return false on invalid permissions", () => {
    const canDo = authorizationService.userCanDo(
      {
        isSuperUser: false,
        permissions: ["delete:something"],
      },
      ["create:something"],
    );

    expect(canDo).toBeFalsy();

    const canDo2 = authorizationService.userCanDo(
      {
        isSuperUser: false,
        permissions: [],
      },
      ["create:something"],
    );

    expect(canDo2).toBeFalsy();
  });

  it("Should add update a role", async () => {
    const sampleRole = {
      ...fullRole,
      users: [
        {
          id: 1,
          username: "admin",
          password:
            "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
          isSuperUser: false,
        },
      ],
      permissions: [
	{
	  id: 1,
	  name: "read:role",
	}
      ],
    };

    mockAuthorizationRepository.updateRole.mockResolvedValueOnce(
      sampleRole,
    );

    const role = await authorizationService.updateRole(1, {
      userIds: [1],
      permissionIds: [1],
    });

    expect(
      mockAuthorizationRepository.updateRole,
    ).toHaveBeenCalledExactlyOnceWith(1, {
      userIds: [1],
      permissionIds: [1],
    });

    expect(role).toEqual(sampleRole);
  });

  it("Should return a role by ID", async () => {
    const sampleRole = {
      ...fullRole,
      users: [
        {
          id: 1,
          username: "Admin",
          isSuperUser: true,
        },
      ],
      permissions: [],
    };

    mockAuthorizationRepository.findRoleById.mockResolvedValueOnce(sampleRole);

    const role = await authorizationService.findRoleById(1);

    expect(
      mockAuthorizationRepository.findRoleById,
    ).toHaveBeenCalledExactlyOnceWith(1);

    expect(role).toEqual(sampleRole);
  });
});
