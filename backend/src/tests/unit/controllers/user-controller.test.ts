import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { IUserController, UserController } from "@/controllers/UserController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";
import { parseCookie } from "@/utils/cookie-parser";

const mockUserService = {
  createUser: vi.fn(),
  loginUser: vi.fn(),
  refreshUser: vi.fn(),
  findAllUsers: vi.fn(),
};

const mockAuthorizationService = {
  userCanDo: vi.fn(),
};

const baseClaims = {
  isSuperUser: true,
};

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => event.req.body,
}));

vi.mock("@/utils/cookie-parser", () => ({
  parseCookie: vi.fn(),
}));

describe("UserController", () => {
  let userController: IUserController;

  const validCredentials = {
    username: "admin",
    password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    userController = new UserController(mockUserService, mockAuthorizationService);
  });

  it("should call createUser with correct data", async () => {
    mockUserService.createUser.mockResolvedValueOnce({
      id: 1,
      username: validCredentials.username,
      password: "hash",
      refresh_token_version: 1,
    });

    const event = new H3Event(
      createRequest({ method: "POST", body: validCredentials }),
    );

    await userController.postCreate(event);

    expect(mockUserService.createUser).toHaveBeenCalledExactlyOnceWith(
      validCredentials,
    );
  });

  it("should return a correctly formatted response after creating user", async () => {
    mockUserService.createUser.mockResolvedValueOnce({
      id: 1,
      username: validCredentials.username,
      password: "hash",
      refresh_token_version: 1,
    });

    const event = new H3Event(
      createRequest({ method: "POST", body: validCredentials }),
    );
    const response = await userController.postCreate(event);

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Successfully created user",
      data: {
        id: 1,
        username: validCredentials.username,
      },
    });
  });

  it.each([
    { field: "username", value: "sho" },
    { field: "password", value: "short" },
  ])("should throw on invalid %s during creation", async ({ field, value }) => {
    const invalidData = { ...validCredentials, [field]: value };

    const event = new H3Event(
      createRequest({ method: "POST", body: invalidData }),
    );
    const error = await userController.postCreate(event).catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it.each([
    { field: "username", value: "sho" },
    { field: "password", value: "short" },
  ])("should throw on invalid %s during login", async ({ field, value }) => {
    const invalidData = { ...validCredentials, [field]: value };

    const event = new H3Event(
      createRequest({ method: "POST", body: invalidData }),
    );
    const error = await userController.postLogin(event).catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it("should login user and set refresh token cookie", async () => {
    mockUserService.loginUser.mockResolvedValueOnce({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    const event = new H3Event(
      createRequest({ method: "POST", body: validCredentials }),
    );
    const response = await userController.postLogin(event);

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Successfully logged in user",
      data: expect.objectContaining({ accessToken: "accessToken" }),
    });

    const cookie = event._res!.headers.get("set-cookie");
    expect(cookie).toMatch(/refreshToken=refreshToken/);
    expect(cookie).toMatch(/Max-Age=315360000000/);
  });

  it("should refresh user and set new refresh token cookie", async () => {
    mockUserService.refreshUser.mockResolvedValueOnce({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    (parseCookie as Mock).mockReturnValueOnce(
      "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
    );

    const event = new H3Event(
      createRequest({
        method: "POST",
        cookies: {
          refreshtoken: "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
        },
      }),
    );

    const response = await userController.postRefresh(event);

    expect(mockUserService.refreshUser).toHaveBeenCalledExactlyOnceWith(
      "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
    );

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Successfully refreshed user",
      data: { accessToken: "accessToken" },
    });

    const cookie = event._res!.headers.get("set-cookie");
    expect(cookie).toMatch(/refreshToken=refreshToken/);
    expect(cookie).toMatch(/Max-Age=315360000000/);
  });

  it("should return all users if user has permission", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);
    const sampleUsers = [
      {
        id: 1,
        username: "user1",
        isSuperUser: true,
      },
    ];

    mockUserService.findAllUsers.mockResolvedValueOnce(sampleUsers);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    const response = await userController.getAllUsers(event);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["read:user"]);

    expect(mockUserService.findAllUsers).toHaveBeenCalledOnce();

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleUsers,
    });
  });

  it("should throw when user does not have permission to get all users", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    const error = await userController.getAllUsers(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["read:user"]);

    expect(mockUserService.findAllUsers).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  });
});
