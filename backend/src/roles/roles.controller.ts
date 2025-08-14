import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
} from "@nestjs/common";
import { RolesService } from "./roles.service";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AuthenticationGuard } from "../authentication/authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { Permission } from "../authorization/permission.decorator";
import { ApiResponse } from "../api-response";
import { ChangeAssociationsDto } from "./dto/change-associations.dto";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["create:role"])
  async create(@Body() createRoleDto: CreateRoleDto) {
    const roleResult = await this.rolesService.create(createRoleDto);

    if (roleResult.isErr()) {
      throw new HttpException(ApiResponse.error(roleResult.error), 500);
    }

    return ApiResponse.success(roleResult.value, 201);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:role"])
  async findAll() {
    const rolesResult = await this.rolesService.findAll();

    if (rolesResult.isErr()) {
      throw new HttpException(ApiResponse.error(rolesResult.error), 500);
    }

    return ApiResponse.success(rolesResult.value);
  }

  @Get(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:role", "read:user", "read:permission"])
  async findOne(@Param("id") id: string) {
    const roleResult = await this.rolesService.findOne(+id);

    if (roleResult.isErr()) {
      throw new HttpException(ApiResponse.error(roleResult.error), 500);
    }

    return ApiResponse.success(roleResult.value);
  }

  @Patch(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["update:role"])
  async updateOne(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const roleResult = await this.rolesService.updateOne(+id, updateRoleDto);

    if (roleResult.isErr()) {
      throw new HttpException(ApiResponse.error(roleResult.error), 500);
    }

    return ApiResponse.success(roleResult.value);
  }

  @Delete(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["delete:role"])
  async deleteOne(@Param("id") id: string) {
    const roleResult = await this.rolesService.deleteOne(+id);

    if (roleResult.isErr()) {
      throw new HttpException(ApiResponse.error(roleResult.error), 500);
    }

    return ApiResponse.success(roleResult.value);
  }

  @Patch(":id/associations")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["update:role", "read:user", "read:permission"])
  async patchAssociations(
    @Param("id") id: string,
    @Body() updateAssociationsDto: ChangeAssociationsDto,
  ) {
    const associationResult = await this.rolesService.createAssociations(
      +id,
      updateAssociationsDto,
    );

    if (associationResult.isErr()) {
      throw new HttpException(ApiResponse.error(associationResult.error), 500);
    }

    return ApiResponse.success(null);
  }

  @Delete(":id/associations")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["delete:role"])
  async deleteAssociations(
    @Param("id") id: string,
    @Body() deleteAssociationsDto: ChangeAssociationsDto,
  ) {
    const disassociationResult = await this.rolesService.deleteAssociations(
      +id,
      deleteAssociationsDto,
    );

    if (disassociationResult.isErr()) {
      throw new HttpException(
        ApiResponse.error(disassociationResult.error),
        500,
      );
    }

    return ApiResponse.success(null);
  }
}
