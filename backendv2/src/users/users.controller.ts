import { Controller, Get, UseGuards, HttpException } from "@nestjs/common";

import { AuthenticationGuard } from "../authentication/authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { Permission } from "../authorization/permisision.decorator";
import { UsersService } from "./users.service";
import { ApiResponse } from "../api-response";

@Controller("users")
export class UsersController {
  constructor(private readonly usersSerivce: UsersService) {}

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:user"])
  async findAll() {
    const usersResult = await this.usersSerivce.findAll();

    if (usersResult.isErr()) {
      throw new HttpException(ApiResponse.error(usersResult.error), 500);
    }

    return ApiResponse.success(usersResult.value);
  }
}
