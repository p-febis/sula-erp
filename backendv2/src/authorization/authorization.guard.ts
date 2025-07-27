import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "./permisision.decorator";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const permissions = this.reflector.get(Permission, context.getHandler());

    const userPermissions = context.switchToHttp().getRequest()["user"]
      ?.permissions as string[];

    const isAuthorized = permissions.every((el) =>
      userPermissions.includes(el),
    );

    return isAuthorized;
  }
}
