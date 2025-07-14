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
    findAllPermissions: vi.fn(),
    updateRole: vi.fn(),
    findRoleById: vi.fn(),
    unlinkRoleAssociations: vi.fn(),
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
        is_super_user: true,
        permissions: [],
      },
      ["create:something"],
    );

    expect(canDo).toBeTruthy();

    const canDo2 = authorizationService.userCanDo(
      {
        is_super_user: false,
        permissions: ["create:something"],
      },
      ["create:something"],
    );

    expect(canDo2).toBeTruthy();
  });

  it("Should return false on invalid permissions", () => {
    const canDo = authorizationService.userCanDo(
      {
        is_super_user: false,
        permissions: ["delete:something"],
      },
      ["create:something"],
    );

    expect(canDo).toBeFalsy();

    const canDo2 = authorizationService.userCanDo(
      {
        is_super_user: false,
        permissions: [],
      },
      ["create:something"],
    );

    expect(canDo2).toBeFalsy();
  });

  it("Should update a role", async () => {
    const sampleRole = {
      ...fullRole,
      users: [
        {
          user: {
            username: "admin",
          },
        },
      ],
      permissions: [
        {
          permission: {
            name: "read:role",
          },
        },
      ],
    };

    mockAuthorizationRepository.updateRole.mockResolvedValueOnce(sampleRole);

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
            is_super_user: true,
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

  it("Should return all permissions", async () => {
    const allPermissions = [
      {
        id: 1,
        key: "create:something",
      },
      {
        id: 2,
        key: "delete:something",
      },
    ];

    mockAuthorizationRepository.findAllPermissions.mockResolvedValueOnce(
      allPermissions,
    );

    const result = await authorizationService.allPermissions();
    expect(result).toEqual(allPermissions);
  });

  it("Should unlink users & permissions from a role", async () => {
    const sampleRole = {
      ...fullRole,
      users: [],
      permissions: [],
    };

    mockAuthorizationRepository.unlinkRoleAssociations.mockResolvedValueOnce(
      sampleRole,
    );

    const role = await authorizationService.unlinkRoleAssociations(1, {
      userIds: [1],
      permissionIds: [1],
    });

    expect(
      mockAuthorizationRepository.unlinkRoleAssociations,
    ).toHaveBeenCalledExactlyOnceWith(1, {
      userIds: [1],
      permissionIds: [1],
    });

    expect(role).toEqual(sampleRole);
  });
});
