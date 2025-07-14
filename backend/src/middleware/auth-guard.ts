import { ErrorResponse } from "@/responses/api";
import { getRequestURL, H3Event } from "h3";
import jwt from "jsonwebtoken";

export const authMiddleware = (exclude = "/auth/") => {
  return (event: H3Event) => {
    const url = getRequestURL(event);
    if (url.pathname.startsWith(exclude)) {
      return;
    }

    const authenticationHeader = event.headers.get("Authorization");

    if (!authenticationHeader || !authenticationHeader.startsWith("Bearer ")) {
      throw new ErrorResponse(
        "Missing or invalid Authorization header",
        null,
        401,
      );
    }

    const [, accessToken] = authenticationHeader.split(" ");

    const [canPass, claims] = authGaurd(accessToken);

    if (!canPass || !claims) {
      throw new ErrorResponse(
        "Missing or invalid Authorization header",
        null,
        401,
      );
    }

    event.context.claims = claims.authorization;
  };
};

type Claims = {
  sub: number;
  authorization: {
    is_super_user: boolean;
    permissions: string[];
  };
};

export const authGaurd = (accessToken: string): [boolean, Claims | null] => {
  try {
    const claims = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    return [true, claims as unknown as Claims];
  } catch {
    return [false, null];
  }
};
