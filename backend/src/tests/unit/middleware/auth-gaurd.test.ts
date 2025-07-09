import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { authGaurd } from "@/middleware/auth-guard";

describe("Authentication middleware", () => {
  it("Should allow requests with a valid token", () => {
    const accessToken = jwt.sign(
      {
        sub: 1,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "15min",
      },
    );

    const shallPass = authGaurd(accessToken);

    expect(shallPass).toBeTruthy();
  });

  it("Should disallow requests with an invalid token", () => {
    const accessToken = jwt.sign(
      {
        sub: 1,
      },
      "totallynotavalidsecret",
      {
        expiresIn: "15min",
      },
    );

    const shallPass = authGaurd(accessToken);

    expect(shallPass).toBeFalsy();
  });
});
