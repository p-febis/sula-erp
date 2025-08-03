import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationRepository } from "./authorization.repository";

@Module({
  providers: [AuthorizationService, AuthorizationRepository],
  exports: [AuthorizationService, AuthorizationRepository],
})
export class AuthorizationModule {}
