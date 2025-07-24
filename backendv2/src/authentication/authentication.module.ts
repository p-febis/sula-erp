import { Module } from "@nestjs/common";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { UsersModule } from "../users/users.module";
import { SessionModule } from "../session/session.module";
import { JwtService } from "../jwt/jwt.service";

@Module({
  imports: [UsersModule, SessionModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, JwtService],
})
export class AuthenticationModule {}
