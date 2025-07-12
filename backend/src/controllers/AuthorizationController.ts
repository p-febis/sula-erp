import { CreateRoleDto, UpdateRoleDto } from "@/models/authorization";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { IAuthorizationService } from "@/services/AuthorizationService";
import { parseBodyAsync } from "@/utils/body-parser";
import { H3Event } from "h3";

export interface IAuthorizationController {
  postCreateRole(event: H3Event): Promise<SuccessResponse>;
  getAllRoles(event: H3Event): Promise<SuccessResponse>;
  getAllPermissions(event: H3Event): Promise<SuccessResponse>;
  patchAddUsersToRole(event: H3Event): Promise<SuccessResponse>;
  getOneRole(event: H3Event): Promise<SuccessResponse>;
}

export class AuthorizationController implements IAuthorizationController {
  m_authorizationService: IAuthorizationService;

  constructor(authorizationService: IAuthorizationService) {
    this.m_authorizationService = authorizationService;
  }

  async postCreateRole(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(event.context.claims, [
      "create:role",
    ]);

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403);
    }

    const body = (await parseBodyAsync(event)) as CreateRoleDto;
    const role = await this.m_authorizationService.createRole(body);
    return new SuccessResponse("Created role!", role, 201);
  }

  async getAllRoles(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(event.context.claims, [
      "read:role",
    ]);

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403);
    }

    const roles = await this.m_authorizationService.allRoles();
    return new SuccessResponse("Success", roles);
  }

  async patchAddUsersToRole(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(event.context.claims, [
      "update:role",
    ]);

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403);
    }

    const body = (await parseBodyAsync(event)) as UpdateRoleDto;
    const { id: roleId } = event.context.params!;

    const role = await this.m_authorizationService.updateRole(
      Number(roleId),
      body,
    );

    return new SuccessResponse("Updated role!", role);
  }

  async getOneRole(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(event.context.claims, [
      "read:role",
    ]);

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403);
    }

    const { id: roleId } = event.context.params!;

    const role = await this.m_authorizationService.findRoleById(Number(roleId));

    return new SuccessResponse("Success", role);
  }

  async getAllPermissions(event: H3Event) {
    const canDo = this.m_authorizationService.userCanDo(event.context.claims, [
      "read:permission",
    ]);

    if (!canDo) {
      throw new ErrorResponse("Forbidden", null, 403);
    }

    const permissions = await this.m_authorizationService.allPermissions();

    return new SuccessResponse("Success", permissions);
  }
}
