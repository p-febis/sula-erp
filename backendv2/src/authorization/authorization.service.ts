import { Injectable } from "@nestjs/common";
import { AuthorizationRepository } from "./authorization.repository";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async findUserPermissions(userId: number) {
    const permissions =
      await this.authorizationRepository.findAllPermissionsForUser(userId);

    return permissions;
  }
}
