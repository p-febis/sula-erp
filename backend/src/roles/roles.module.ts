import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { RolesRepository } from "./roles.repository";
import { JwtService } from "../jwt/jwt.service";

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, JwtService],
})
export class RolesModule {}
