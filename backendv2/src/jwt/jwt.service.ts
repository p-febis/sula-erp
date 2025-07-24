import { Injectable } from "@nestjs/common";
import { sign, verify } from "@node-rs/jsonwebtoken";
import { err, ok } from "neverthrow";
import { AccessTokenClaimsDto } from "./dto/access-token-claims.dto";

const getUtcTimestamp = () => Math.floor(new Date().getTime() / 1000);
const FIFTEEN_MINUTES_SECONDS = 900;

@Injectable()
export class JwtService {
  async signAccessToken(claims: AccessTokenClaimsDto) {
    const issuedAt = getUtcTimestamp();

    try {
      const accessToken = await sign(
        {
          iat: issuedAt,
          exp: issuedAt + FIFTEEN_MINUTES_SECONDS,
          ...claims,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );
      return ok(accessToken);
    } catch (e) {
      return err();
    }
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const decodedClaims = await verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );

      return ok(decodedClaims);
    } catch (e) {
      return err("Failed to verify access token");
    }
  }
}
