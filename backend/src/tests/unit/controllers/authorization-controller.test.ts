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

  it("Should call createRole with correct data", async () => {
    mockAuthorizationService.createRole.mockResolvedValueOnce(sampleRole);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );

    const response = await authorizationController.postCreateRole(event);
    expect(mockAuthorizationService.createRole).toHaveBeenCalledExactlyOnceWith(
      sampleCreateBody,
    );
    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created role!",
      data: sampleRole,
    });
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
