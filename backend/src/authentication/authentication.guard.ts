import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { JwtService } from "../jwt/jwt.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const payload = await this.jwtService.verifyAccessToken(token);

    if (payload.isErr()) {
      throw new UnauthorizedException();
    }

    request["user"] = payload.value;

    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest) {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }
}
