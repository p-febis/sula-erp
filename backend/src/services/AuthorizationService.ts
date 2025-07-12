import { CreateRoleDto, UpdateRoleDto } from "@/models/authorization";
import { IAuthorizationRepository } from "@/repositories/AuthorizationRepository";
import { Permission, Role } from "generated/prisma";

export type PermissionClaims = {
  isSuperUser: boolean;
  permissions: string[];
};

export interface IAuthorizationService {
  createRole(roleCreationData: CreateRoleDto): Promise<Role | null>;
  allRoles(): Promise<Role[] | null>;
  allPermissions(): Promise<Permission[] | null>;
  userCanDo(claims: PermissionClaims, requiredPermissions: string[]): boolean;
  updateRole(
    roleId: number,
    roleUpdateData: UpdateRoleDto,
  ): Promise<Role | null>;
  findRoleById(roleId: number): Promise<Role | null>;
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

  async updateRole(roleId: number, updateRoleData: UpdateRoleDto) {
    const role = await this.m_authorizationRepository.updateRole(
      roleId,
      updateRoleData,
    );

    return role;
  }

  async findRoleById(roleId: number) {
    const role = await this.m_authorizationRepository.findRoleById(roleId);
    return role;
  }

  async allPermissions() {
    const permissions =
      await this.m_authorizationRepository.findAllPermissions();

    return permissions;
  }
}
