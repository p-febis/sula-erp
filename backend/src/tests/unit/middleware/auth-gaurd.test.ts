import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { authGaurd } from "@/middleware/auth-guard";

describe("Authentication middleware", () => {
  const claims = {
    sub: 1,
    is_super_user: true,
    permissions: [],
  };

  it("Should allow requests with a valid token", () => {
    const accessToken = jwt.sign(claims, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "15min",
    });

    const [shallPass, tokenClaims] = authGaurd(accessToken);

    expect(shallPass).toBeTruthy();
    expect(tokenClaims).toEqual(expect.objectContaining(claims));
  });

  it("Should disallow requests with an invalid token", () => {
    const accessToken = jwt.sign(claims, "totallynotavalidsecret", {
      expiresIn: "15min",
    });

    const [shallPass, tokenClaims] = authGaurd(accessToken);

    expect(shallPass).toBeFalsy();
    expect(tokenClaims).toEqual(null);
  });
});
