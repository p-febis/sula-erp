import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Reflector } from "@nestjs/core";
import { Permission } from "../authorization/permission.decorator";
import assert from "assert";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { AuthenticationGuard } from "../authentication/authentication.guard";

export function assertAuthorizationWithPermissions(
  on: ((...args: any[]) => any) | (new (...args: any[]) => unknown),
  permissionsToCheck: string[],
) {
  let reflector = new Reflector();
  const guards: any[] = Reflect.getMetadata(GUARDS_METADATA, on);

  const permissions = reflector.get(Permission, on);

  assert(guards.includes(AuthenticationGuard));
  assert(guards.includes(AuthorizationGuard));

  assert.deepStrictEqual(permissions, permissionsToCheck);
}
