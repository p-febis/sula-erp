import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationGuard } from "./authentication.guard";
import { JwtService } from "../jwt/jwt.service";
import { err, ok } from "neverthrow";

describe("AuthenticationGuard", () => {
  let guard: AuthenticationGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAccessToken: vi.fn(),
  };

  const request = {
    headers: {
      authorization: "",
    },
    user: undefined,
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    request.user = undefined;
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(new AuthenticationGuard(null)).toBeDefined();
  });

  it("should return true if the token is valid", async () => {
    request.headers.authorization = `Bearer 2d4425e1-4274-4c7a-8537-77788e01d168`;
    mockJwtService.verifyAccessToken.mockResolvedValueOnce(
      ok({
        sub: 1,
      }),
    );

    const canActivate = await guard.canActivate(mockExecutionContext);
    expect(mockJwtService.verifyAccessToken).toHaveBeenCalledTimes(1);
    expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith(
      "2d4425e1-4274-4c7a-8537-77788e01d168",
    );

    expect(request["user"]).toEqual({
      sub: 1,
    });

    expect(canActivate).toBeTruthy();
  });

  it("should throw an error if the token is invalid", async () => {
    request.headers.authorization = `Bearer 2d4425e1-4274-4c7a-8537-77788e01d168`;
    mockJwtService.verifyAccessToken.mockResolvedValueOnce(
      err("Failed to verify access token"),
    );

    const canActivateError = await guard
      .canActivate(mockExecutionContext)
      .catch((e) => e);
    expect(mockJwtService.verifyAccessToken).toHaveBeenCalledTimes(1);
    expect(mockJwtService.verifyAccessToken).toHaveBeenCalledWith(
      "2d4425e1-4274-4c7a-8537-77788e01d168",
    );

    expect(canActivateError).toBeInstanceOf(UnauthorizedException);

    expect(request["user"]).not.toBeDefined();
  });
});
