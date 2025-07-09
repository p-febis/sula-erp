import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { IUserController, UserController } from "@/controllers/UserController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";
import { parseCookie } from "@/utils/cookie-parser";

const mockUserService = {
  createUser: vi.fn(),
  loginUser: vi.fn(),
  refreshUser: vi.fn(),
};

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => {
    return event.req.body;
  },
}));

vi.mock("@/utils/cookie-parser", () => ({
  parseCookie: vi.fn(),
}));

describe("UserController", () => {
  let userController: IUserController;

  beforeEach(() => {
    vi.resetAllMocks();
    userController = new UserController(mockUserService);
  });

  it("Should call createUser with correct data", async () => {
    mockUserService.createUser.mockResolvedValueOnce({
      id: 1,
      username: "admin",
      password: "9ddbce59-1ef7-4e29-a136-94ff4091a8a3",
      refresh_token_version: 1,
    });

    const request = createRequest({
      method: "POST",
      body: {
        username: "admin",
        password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
      },
    });

    const event = new H3Event(request);
    await userController.postCreate(event);

    expect(mockUserService.createUser).toHaveBeenCalledExactlyOnceWith({
      username: "admin",
      password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
    });
  });

  it("Should return a correctly formatted response", async () => {
    mockUserService.createUser.mockResolvedValueOnce({
      id: 1,
      username: "admin",
      password: "9ddbce59-1ef7-4e29-a136-94ff4091a8a3",
      refresh_token_version: 1,
    });

    const request = createRequest({
      method: "POST",
      body: {
        username: "admin",
        password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
      },
    });

    const event = new H3Event(request);
    const response = await userController.postCreate(event);

    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Successfully created user",
      data: {
        id: 1,
        username: "admin",
      },
    });
  });

  it.each([
    { field: "username", value: "sho" },
    { field: "password", value: "short" },
  ])(
    "Should throw error on invalid $field creation",
    async ({ field, value }) => {
      const request = createRequest({
        method: "POST",
        body: {
          username: "admin",
          password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
          ...{ [field]: value },
        },
      });

      const event = new H3Event(request);
      const responsePromise = userController.postCreate(event);

      const error = await responsePromise.catch((e) => e);

      expect(error.cause).toEqual({
        status: 400,
        statusText: "Bad Request",
        message: "Bad Request",
        data: null,
      });
    },
  );

  it.each([
    { field: "username", value: "sho" },
    { field: "password", value: "short" },
  ])("Should throw error on invalid $field login", async ({ field, value }) => {
    const request = createRequest({
      method: "POST",
      body: {
        username: "admin",
        password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
        ...{ [field]: value },
      },
    });

    const event = new H3Event(request);
    const responsePromise = userController.postLogin(event);

    const error = await responsePromise.catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it("Should login user", async () => {
    mockUserService.loginUser.mockResolvedValueOnce({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    const request = createRequest({
      method: "POST",
      body: {
        username: "admin",
        password: "06740fbb-fb11-44d8-a6f5-bcf9ad7734c0",
      },
    });

    const event = new H3Event(request);
    const response = await userController.postLogin(event);

    expect(response.message).toBe("Successfully logged in user");
    expect(response.data).toEqual(
      expect.objectContaining({
        accessToken: "accessToken",
      }),
    );

    const cookieString = event._res!.headers.get("set-cookie");

    expect(cookieString).toMatch(/refreshToken=refreshToken/);
    expect(cookieString).toMatch(/Max-Age=315360000000/);
  });

  it("Should refresh a user", async () => {
    mockUserService.refreshUser.mockResolvedValueOnce({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });

    const request = createRequest({
      method: "POST",
      cookies: {
        refreshtoken: "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
      },
    });

    (parseCookie as any).mockReturnValueOnce(
      "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
    );

    const event = new H3Event(request);
    const response = await userController.postRefresh(event);

    expect(mockUserService.refreshUser).toHaveBeenCalledExactlyOnceWith(
      "0a4abb8e-f8d8-4705-ba8c-dc9968a7848a",
    );
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Successfully refreshed user",
      data: {
        accessToken: "accessToken",
      },
    });

    const cookieString = event._res!.headers.get("set-cookie");

    expect(cookieString).toMatch(/refreshToken=refreshToken/);
    expect(cookieString).toMatch(/Max-Age=315360000000/);
  });
});
