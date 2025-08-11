import { Controller, Get, HttpException, UseGuards } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { AuthenticationGuard } from "../authentication/authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { Permission } from "../authorization/permission.decorator";
import { ApiResponse } from "../api-response";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:permission"])
  async findAll() {
    const permissionsResult = await this.permissionsService.findAll();

    if (permissionsResult.isErr()) {
      throw new HttpException(ApiResponse.error(permissionsResult.error), 500);
    }

    return ApiResponse.success(permissionsResult.value);
  }
}
