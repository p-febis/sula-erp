import { beforeEach, describe, expect, it, vi } from "vitest";
import { IUserController, UserController } from "@/controllers/UserController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";

const mockUserService = {
  createUser: vi.fn(),
};

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => {
    return event.req.body;
  },
}));

describe("UserController", () => {
  let userController: IUserController;

  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore
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
  ])("Should throw error on invalid $field", async ({ field, value }) => {
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
  });
});
