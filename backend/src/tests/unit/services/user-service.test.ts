import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService, type IUserService } from "@/services/UserService";
import jwt from "jsonwebtoken";
import { verify } from "@node-rs/argon2";

const mockUserRepository = {
  create: vi.fn(),
  findByName: vi.fn(),
  refreshUser: vi.fn(),
  isFirstUser: vi.fn(),
};

describe("UserService", () => {
  let userService: IUserService;

  const testPassword = "eee914af-0b6b-4b43-a2da-dcdc125ff18b";
  const testHash =
    "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ";

  beforeEach(() => {
    vi.resetAllMocks();
    userService = new UserService(mockUserRepository);
  });

  it("should create and return user with hashed password", async () => {
    let capturedPassword: string = "";

    mockUserRepository.isFirstUser.mockResolvedValueOnce(true);
    mockUserRepository.create.mockImplementationOnce(async (data) => {
      capturedPassword = data.password;
      return {
        id: 1,
        username: data.username,
        password: capturedPassword,
        isSuperUser: true,
      };
    });

    const user = await userService.createUser({
      username: "Admin",
      password: testPassword,
    });

    expect(mockUserRepository.isFirstUser).toHaveBeenCalledOnce();

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "Admin",
        password: expect.any(String),
        isSuperUser: true,
      }),
    );

    const isValid = await verify(capturedPassword, testPassword);
    expect(isValid).toBe(true);
    expect(user).toEqual(expect.objectContaining({ id: 1, username: "Admin" }));
  });

  it("should throw if user already exists", async () => {
    mockUserRepository.create.mockResolvedValueOnce(null);

    await expect(
      userService.createUser({ username: "Admin", password: testPassword }),
    ).rejects.toThrow();
  });

  it("should login a valid user", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password: testHash,
    });

    const result = await userService.loginUser({
      username: "Admin",
      password: testPassword,
    });

    expect(mockUserRepository.findByName).toHaveBeenCalledOnce();
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("should not login with incorrect password", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password: testHash,
    });

    await expect(
      userService.loginUser({ username: "Admin", password: "wrong-password" }),
    ).rejects.toThrow();
  });

  it("should not login non-existent user", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce(null);

    await expect(
      userService.loginUser({ username: "Admin", password: testPassword }),
    ).rejects.toThrow("No user!");
  });

  it("should return valid access token", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password: testHash,
      isSuperUser: true,
    });

    const { accessToken } = await userService.loginUser({
      username: "Admin",
      password: testPassword,
    });

    const { payload } = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as {
      payload: {
        sub: number;
        exp: number;
        authorization: { isSuperUser: boolean; permissions: string[] };
      };
    };

    expect(payload.sub).toBe(1);
    expect(payload.authorization).toEqual({
      isSuperUser: true,
      permissions: [],
    });
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("should return valid refresh token", async () => {
    mockUserRepository.findByName.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      refresh_token_version: 1,
      password: testHash,
    });

    const { refreshToken } = await userService.loginUser({
      username: "Admin",
      password: testPassword,
    });

    const { payload } = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as {
      payload: { sub: number; exp: number; refresh_token_version: number };
    };

    expect(payload).toEqual(expect.objectContaining({
      sub: 1,
      refresh_token_version: 1,
      exp: expect.any(Number),
    }))

    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("should refresh access and refresh tokens", async () => {
    mockUserRepository.findByName.mockResolvedValue({
      id: 1,
      username: "Admin",
      refresh_token_version: 1,
      password: testHash,
    });

    mockUserRepository.refreshUser.mockResolvedValue({
      id: 1,
      username: "Admin",
      refresh_token_version: 2,
      password: testHash,
    });

    const { refreshToken } = await userService.loginUser({
      username: "Admin",
      password: testPassword,
    });

    const { accessToken, refreshToken: newRefreshToken } =
      await userService.refreshUser(refreshToken);

    const accessPayload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as { payload: { sub: number; exp: number } };

    expect(accessPayload.payload.sub).toBe(1);
    expect(accessPayload.payload.exp).toBeGreaterThan(Date.now() / 1000);

    const refreshPayload = jwt.verify(
      newRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      { complete: true },
    ) as unknown as {
      payload: { sub: number; exp: number; refresh_token_version: number };
    };

    expect(refreshPayload.payload).toEqual(
      expect.objectContaining({
	sub: 1,
	refresh_token_version: 2,
	exp: expect.any(Number)
      })
    )

    expect(refreshPayload.payload.exp).toBeGreaterThan(Date.now() / 1000);
  });
});
