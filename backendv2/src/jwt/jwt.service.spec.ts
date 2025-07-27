import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "./jwt.service";
import { describe, beforeEach, it, expect } from "@jest/globals";
import { verify } from "@node-rs/jsonwebtoken";
import { ok, err } from "neverthrow";

process.env.ACCESS_TOKEN_SECRET = "a841aa95-f651-450f-8162-8b2ed632eacf";

describe("JwtService", () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should sign the access token", async () => {
    const FIFTEEN_MINUTES_SECONDS = 900;
    const accessTokenResult = await service.signAccessToken({
      sub: 1,
      permissions: ["create:something", "read:something"],
    });

    const value = accessTokenResult._unsafeUnwrap();

    const decodedClaims = await verify(value, process.env.ACCESS_TOKEN_SECRET);

    const { iat: issuedAt } = decodedClaims;

    expect(decodedClaims).toEqual({
      sub: 1,
      iat: issuedAt,
      permissions: ["create:something", "read:something"],
      exp: issuedAt + FIFTEEN_MINUTES_SECONDS,
    });
  });

  it("should verify the access token", async () => {
    const accessTokenResult = await service.signAccessToken({
      sub: 1,
      permissions: ["create:something", "read:something"],
    });

    const verified = await service.verifyAccessToken(
      accessTokenResult._unsafeUnwrap(),
    );

    expect(verified).toEqual(ok(expect.objectContaining({ sub: 1 })));
  });

  it("should fail to verify an invalid access token", async () => {
    const verified = await service.verifyAccessToken("invalid-access-token");

    expect(verified).toEqual(err("Failed to verify access token"));
  });
});
