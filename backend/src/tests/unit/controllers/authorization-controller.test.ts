import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";
import {
  AuthorizationController,
  IAuthorizationController,
} from "@/controllers/AuthorizationController";

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => {
    return event.req.body;
  },
}));

describe("AuthorizationController", () => {
  let authorizationController: IAuthorizationController;

  const mockAuthorizationService = {
    userCanDo: vi.fn(),
    createRole: vi.fn(),
    allRoles: vi.fn(),
    allPermissions: vi.fn(),
    updateRole: vi.fn(),
    unlinkRoleAssociations: vi.fn(),
    findRoleById: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    authorizationController = new AuthorizationController(
      mockAuthorizationService,
    );
  });

  const sampleRole = {
    id: 1,
    name: "Marketing",
    users: [],
    permissions: [],
  };

  const baseClaims = {
    isSuperUser: true,
  };
  const sampleCreateBody = {
    name: "Marketing",
  };

  const samplePermission = {
    id: 1,
    key: "create:something",
  };

  it.each([
    {
      title: "a superuser",
      claims: { isSuperUser: true, permissions: [] },
    },
    {
      title: "a user with the correct permission",
      claims: { isSuperUser: false, permissions: ["create:role"] },
    },
  ])(
    "Should call createRole with correct data & $title",
    async ({ claims }) => {
      mockAuthorizationService.createRole.mockResolvedValueOnce(sampleRole);
      mockAuthorizationService.userCanDo.mockReturnValue(true);

      const event = new H3Event(
        createRequest({ method: "POST", body: sampleCreateBody }),
      );

      event.context.claims = claims;

      const response = await authorizationController.postCreateRole(event);

      expect(
        mockAuthorizationService.userCanDo,
      ).toHaveBeenCalledExactlyOnceWith(claims, ["create:role"]);

      expect(
        mockAuthorizationService.createRole,
      ).toHaveBeenCalledExactlyOnceWith(sampleCreateBody);

      expect(response).toEqual({
        status: 201,
        statusText: "OK",
        message: "Created role!",
        data: sampleRole,
      });
    },
  );

  it("Should not call createRole with correct data a user without permission", async () => {
    mockAuthorizationService.createRole.mockResolvedValueOnce(sampleRole);
    mockAuthorizationService.userCanDo.mockReturnValue(false);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );

    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };

    await expect(
      authorizationController.postCreateRole(event),
    ).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      {
        isSuperUser: false,
        permissions: [],
      },
      ["create:role"],
    );

    expect(mockAuthorizationService.createRole).not.toHaveBeenCalledOnce();
  });

  it("Should return all roles if the user has permission", async () => {
    const all = [sampleRole];
    mockAuthorizationService.allRoles.mockResolvedValueOnce(all);
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    const response = await authorizationController.getAllRoles(event);
    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:role"],
    );
    expect(mockAuthorizationService.allRoles).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: all,
    });
  });

  it("Should not call allRoles if the user doesn't have permission", async () => {
    const all = [sampleRole];
    mockAuthorizationService.allRoles.mockResolvedValueOnce(all);
    mockAuthorizationService.userCanDo.mockReturnValue(false);

    const event = new H3Event(createRequest({ method: "GET" }));

    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };

    await expect(authorizationController.getAllRoles(event)).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:role"],
    );
    expect(mockAuthorizationService.allRoles).not.toHaveBeenCalledOnce();
  });

  it("Should call updateRole", async () => {
    const updatedRole = {
      ...sampleRole,
      users: [
        {
          user: {
            id: 1,
            username: "Admin",
            isSuperUser: true,
          },
        },
      ],
    };

    mockAuthorizationService.updateRole.mockResolvedValueOnce(updatedRole);
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(
      createRequest({
        method: "PATCH",
        body: {
          userIds: [1],
          permissionIds: [1],
        },
      }),
    );

    event.context.claims = baseClaims;
    event.context.params = { id: "1" };

    const response = await authorizationController.patchUpdateRole(event);

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["update:role"],
    );

    expect(mockAuthorizationService.updateRole).toHaveBeenCalledExactlyOnceWith(
      1,
      {
        userIds: [1],
        permissionIds: [1],
      },
    );

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Updated role!",
      data: updatedRole,
    });
  });

  it("Should not call updateRole if the user doesn't have permission", async () => {
    mockAuthorizationService.userCanDo.mockReturnValue(false);

    const event = new H3Event(
      createRequest({
        method: "PATCH",
        body: {
          userIds: [1],
        },
      }),
    );
    event.context.params = { id: "1" };

    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };

    await expect(
      authorizationController.patchUpdateRole(event),
    ).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["update:role"],
    );

    expect(mockAuthorizationService.updateRole).not.toHaveBeenCalledOnce();
  });

  it("Should call findRoleById if the user has permission", async () => {
    mockAuthorizationService.findRoleById.mockResolvedValueOnce(sampleRole);
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    event.context.params = { id: "1" };

    const response = await authorizationController.getOneRole(event);

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:role"],
    );

    expect(
      mockAuthorizationService.findRoleById,
    ).toHaveBeenCalledExactlyOnceWith(1);

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleRole,
    });
  });

  it("Should not call findRoleById if the user doesn't have permission", async () => {
    mockAuthorizationService.userCanDo.mockReturnValue(false);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.params = { id: "1" };

    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };

    await expect(authorizationController.getOneRole(event)).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:role"],
    );

    expect(mockAuthorizationService.updateRole).not.toHaveBeenCalledOnce();
  });

  it("Should call allPermissions if the user has permission", async () => {
    const all = [samplePermission];
    mockAuthorizationService.allPermissions.mockResolvedValueOnce(all);
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    const response = await authorizationController.getAllPermissions(event);
    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:permission"],
    );
    expect(mockAuthorizationService.allPermissions).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: all,
    });
  });

  it("Should not call allPermissions if the user doesn't have permission", async () => {
    const all = [samplePermission];
    mockAuthorizationService.allPermissions.mockResolvedValueOnce(all);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };

    await expect(
      authorizationController.getAllPermissions(event),
    ).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["read:permission"],
    );
    expect(mockAuthorizationService.allPermissions).not.toHaveBeenCalledOnce();
  });

  it("Should call unlinkRoleAssociations if the user has permission", async () => {
    mockAuthorizationService.unlinkRoleAssociations.mockResolvedValueOnce(
      sampleRole,
    );
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(
      createRequest({
        method: "PATCH",
        body: {
          userIds: [1],
          permissionIds: [1],
        },
      }),
    );
    event.context.claims = baseClaims;
    event.context.params = { id: "1" };

    const response =
      await authorizationController.deleteUnlinkRoleAssociations(event);

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["update:role"],
    );

    expect(
      mockAuthorizationService.unlinkRoleAssociations,
    ).toHaveBeenCalledExactlyOnceWith(1, {
      userIds: [1],
      permissionIds: [1],
    });

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleRole,
    });
  });

  it("Should not call unlinkRoleAssociations if the user doesn't have permission", async () => {
    mockAuthorizationService.userCanDo.mockReturnValue(false);

    const event = new H3Event(
      createRequest({
        method: "PATCH",
        body: {
          userIds: [1],
          permissionIds: [1],
        },
      }),
    );
    event.context.claims = {
      isSuperUser: false,
      permissions: [],
    };
    event.context.params = { id: "1" };

    await expect(
      authorizationController.deleteUnlinkRoleAssociations(event),
    ).rejects.toThrow();

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["update:role"],
    );

    expect(
      mockAuthorizationService.unlinkRoleAssociations,
    ).not.toHaveBeenCalledOnce();
  });
});
