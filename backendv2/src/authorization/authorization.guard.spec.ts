import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { AuthorizationGuard } from "./authorization.guard";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { Reflector } from "@nestjs/core";
import { Permission } from "./permisision.decorator";

describe("AuthorizationGuard", () => {
  let guard: AuthorizationGuard;
  let reflector: jest.Mocked<Reflector>;

  const request = {
    headers: {
      authorization: "",
    },
    user: {
      sub: 1,
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
      permissions: [],
    };

    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    reflector = module.get<Reflector>(Reflector) as jest.Mocked<Reflector>;
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

    reflector.get.mockReturnValueOnce([
      "create:something",
      "read:something",
      "update:something",
      "delete:something",
    ]);

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(reflector.get).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenCalledWith(Permission, null);

    expect(canActivate).toBeTruthy();
  });

  it("should return false if the user is not authorized", async () => {
    request.user.permissions = ["create:something", "read:something"];

    reflector.get.mockReturnValueOnce([
      "create:something",
      "read:something",
      "update:something",
      "delete:something",
    ]);

    const canActivate = await guard.canActivate(mockExecutionContext);

    expect(reflector.get).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenCalledWith(Permission, null);

    expect(canActivate).toBeFalsy();
  });
});
