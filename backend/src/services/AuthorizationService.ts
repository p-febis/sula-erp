import { CreateRoleDto } from "@/models/authorization";
import { IAuthorizationRepository } from "@/repositories/AuthorizationRepository";
import { Role } from "generated/prisma";

export type PermissionClaims = {
  isSuperUser: boolean;
  permissions: string[];
};

export interface IAuthorizationService {
  createRole(roleCreationData: CreateRoleDto): Promise<Role | null>;
  allRoles(): Promise<Role[] | null>;
  userCanDo(claims: PermissionClaims, requiredPermissions: string[]): boolean;
}

export class AuthorizationService implements IAuthorizationService {
  m_authorizationRepository: IAuthorizationRepository;

  constructor(authorizationRepository: IAuthorizationRepository) {
    this.m_authorizationRepository = authorizationRepository;
  }

  async createRole(roleCreationData: CreateRoleDto) {
    const role =
      await this.m_authorizationRepository.createRole(roleCreationData);
    return role;
  }

  async allRoles() {
    const roles = await this.m_authorizationRepository.findAllRoles();

    return roles;
  }

  userCanDo(claims: PermissionClaims, requiredPermissions: string[]): boolean {
    if (claims.isSuperUser) {
      return true;
    }

    return requiredPermissions.every((permission) =>
      claims.permissions.includes(permission),
    );
  }
}
