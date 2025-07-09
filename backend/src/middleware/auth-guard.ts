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

    const canPass = authGaurd(accessToken);

    if (!canPass) {
      throw new ErrorResponse(
        "Missing or invalid Authorization header",
        null,
        401,
      );
    }
  };
};

export const authGaurd = (accessToken: string) => {
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    return true;
  } catch {
    return false;
  }
};
