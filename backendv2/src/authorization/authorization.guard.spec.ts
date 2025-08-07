import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { AuthorizationGuard } from "./authorization.guard";
import { Reflector } from "@nestjs/core";
import { Permission } from "./permission.decorator";

describe("AuthorizationGuard", () => {
  let guard: AuthorizationGuard;
  const mockReflector = {
    get: vi.fn(),
  };

  const request = {
    headers: {
      authorization: "",
    },
    user: {
      sub: 1,
      isSuperUser: false,
      permissions: [],
    },
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => null,
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    request.user = {
      sub: 1,
      isSuperUser: false,
      permissions: [],
    };

    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AuthorizationGuard>(AuthorizationGuard);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should return true if the user is authorized", async () => {
    request.user.permissions = [
      "create:something",
      "read:something",
      "update:something",
      "delete:something",
    ];

    mockReflector.get.mockReturnValueOnce([
      "create:something",
      "read:something",
      "update:something",
      "delete:something",
    ]);

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(mockReflector.get).toHaveBeenCalledTimes(1);
    expect(mockReflector.get).toHaveBeenCalledWith(Permission, null);

    expect(canActivate).toBeTruthy();
  });

  it("should return false if the user is not authorized", async () => {
    request.user.permissions = ["create:something", "read:something"];

    mockReflector.get.mockReturnValueOnce([
      "create:something",
      "read:something",
      "update:something",
      "delete:something",
    ]);

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(mockReflector.get).toHaveBeenCalledTimes(1);
    expect(mockReflector.get).toHaveBeenCalledWith(Permission, null);

    expect(canActivate).toBeFalsy();
  });

  it.each([{ isSuperUser: false }, { isSuperUser: true }])(
    "should return $isSuperUser if isSuperUser is $isSuperUser",
    async ({ isSuperUser }) => {
      request.user.isSuperUser = isSuperUser;

      mockReflector.get.mockReturnValueOnce(["superuser"]);

      const canActivate = await guard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(isSuperUser);
    },
  );
});
