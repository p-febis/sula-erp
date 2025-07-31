import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { AuthorizationRepository } from "./authorization.repository";
import { UpdateRoleAssociationsDto } from "./dto/update-role-associations.dto";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async createRole(createRoleData: CreateRoleDto) {
    const role = await this.authorizationRepository.createRole(createRoleData);

    return role;
  }

  async findUserPermissions(userId: number) {
    const permissions =
      await this.authorizationRepository.findAllPermissionsForUser(userId);

    return permissions;
  }

  async createRoleAssociations(
    roleId: number,
    updateRoleAssociationsData: UpdateRoleAssociationsDto,
  ) {
    const role = await this.authorizationRepository.createRoleAssociations(
      roleId,
      updateRoleAssociationsData,
    );

    return role;
  }
}
