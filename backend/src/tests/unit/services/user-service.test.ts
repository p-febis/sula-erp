import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService, IUserService } from "@/services/UserService";
import jwt from "jsonwebtoken";

const mockUserRepository = {
  create: vi.fn(),
  findByName: vi.fn(),
};

describe("UserService", () => {
  let userService: IUserService;

  beforeEach(() => {
    vi.resetAllMocks();
    userService = new UserService(mockUserRepository);
  });

  it("Should create and return user", async () => {
    mockUserRepository.create.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

    const user = await userService.createUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    expect(mockUserRepository.create).toHaveBeenCalledExactlyOnceWith({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    expect(user).toEqual({
      id: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });
  });

  it("Should throw if a user already exists", async () => {
    mockUserRepository.create.mockResolvedValueOnce(null);

    const userPromise = userService.createUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    await expect(userPromise).rejects.toThrowError();
  });

  it("Should login a valid user", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

    const loginData = await userService.loginUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    expect(mockUserRepository.findByName).toHaveBeenCalledOnce();

    expect(loginData).toBeTruthy();
  });

  it("Should not login an invalid user", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

    const loginDataPromise = userService.loginUser({
      username: "Admin",
      password: "9af4202f-b7bd-4549-b672-b261585e84ee",
    });

    await expect(loginDataPromise).rejects.toThrowError();
  });

  it("Should not login an non existant user", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce(null);

    const loginDataPromise = userService.loginUser({
      username: "Admin",
      password: "9af4202f-b7bd-4549-b672-b261585e84ee",
    });

    await expect(loginDataPromise).rejects.toThrowError("No user!");
  });

  it("Should return a valid access token on login", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

    const loginData = await userService.loginUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    expect(mockUserRepository.findByName).toHaveBeenCalledOnce();

    const parsedTokenData = jwt.verify(
      loginData.accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as { payload: { sub: number; exp: number } };

    expect(parsedTokenData?.payload.sub).toBe(1);
    expect(parsedTokenData?.payload.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("Should return a valid refresh token on login", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      refresh_token_version: 1,
      username: "Admin",
      password:
        "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

    const loginData = await userService.loginUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    expect(mockUserRepository.findByName).toHaveBeenCalledOnce();

    const parsedTokenData = jwt.verify(
      loginData.refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as {
      payload: { sub: number; exp: number; refresh_token_version: number };
    };

    expect(parsedTokenData?.payload.sub).toBe(1);
    expect(parsedTokenData?.payload.refresh_token_version).toBe(1);
    expect(parsedTokenData?.payload.exp).toBeGreaterThan(Date.now() / 1000);
  });
});
