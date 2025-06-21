import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService, IUserService } from "@/services/UserService";

const mockUserRepository = {
  create: vi.fn()
}

describe("UserService", () => {

  let userService: IUserService;

  beforeEach(() => {
    vi.resetAllMocks();
    userService = new UserService(mockUserRepository);
  })

  it("Should create and return user", async () => {

    mockUserRepository.create.mockResolvedValueOnce({
      id: 1,
      username: "Admin",
      password: "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
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
      password: "$argon2id$v=19$m=16,t=2,p=1$cmFuZG9tLXNhbHQ$th+l03f/sP8YVAFse/EOuQ",
    });

  });

  it("Should throw if a user already exists", async () => {
    mockUserRepository.create
    .mockResolvedValueOnce(null)

    const userPromise = userService.createUser({
      username: "Admin",
      password: "eee914af-0b6b-4b43-a2da-dcdc125ff18b",
    });

    await expect(userPromise).rejects.toThrowError();
  });
})
