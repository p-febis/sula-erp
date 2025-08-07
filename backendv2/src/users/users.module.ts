import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { UsersController } from "./users.controller";
import { JwtService } from "../jwt/jwt.service";

@Module({
  providers: [UsersService, UsersRepository, JwtService],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
