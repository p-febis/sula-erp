import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { PermissionsRepository } from "./permissions.repository";
import { JwtService } from "../jwt/jwt.service";

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, JwtService],
})
export class PermissionsModule {}
