import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "./permission.decorator";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const { permissions: userPermissions, isSuperUser } = context
      .switchToHttp()
      .getRequest()["user"] as { permissions: string[]; isSuperUser: boolean };

    if (isSuperUser) {
      return true;
    }

    const permissions = this.reflector.get(Permission, context.getHandler());
    const isAuthorized = permissions.every((el) =>
      userPermissions.includes(el),
    );

    return isAuthorized;
  }
}
