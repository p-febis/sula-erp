import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";
import {
  AuthorizationController,
  IAuthorizationController,
} from "@/controllers/AuthorizationController";
import { permission } from "process";

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

  const sampleCreateBody = {
    name: "Marketing",
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

  it("Should return all roles", async () => {
    const all = [sampleRole];
    mockAuthorizationService.allRoles.mockResolvedValueOnce(all);

    const event = new H3Event(createRequest({ method: "GET" }));
    const response = await authorizationController.getAllRoles(event);
    expect(mockAuthorizationService.allRoles).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: all,
    });
  });
});
