import { Permission, Role } from "@/db/db";
import {
  CreateRoleDto,
  DeleteAssociationsFromRoleDto,
  UpdateRoleDto,
} from "@/models/authorization";
import { IAuthorizationRepository } from "@/repositories/AuthorizationRepository";
import { Selectable } from "kysely";

export type PermissionClaims = {
  is_super_user: boolean;
  permissions: string[];
};

export interface IAuthorizationService {
  createRole(roleCreationData: CreateRoleDto): Promise<Selectable<Role> | null>;
  allRoles(): Promise<Selectable<Role>[] | null>;
  allPermissions(): Promise<Selectable<Permission>[] | null>;
  userCanDo(claims: PermissionClaims, requiredPermissions: string[]): boolean;
  updateRole(
    roleId: number,
    roleUpdateData: UpdateRoleDto,
  ): Promise<Selectable<Role> | null>;
  unlinkRoleAssociations(
    roleId: number,
    roleUpdateData: DeleteAssociationsFromRoleDto,
  ): Promise<Selectable<Role> | null>;
  findRoleById(roleId: number): Promise<Selectable<Role> | null>;
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
    if (claims.is_super_user) {
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

  async unlinkRoleAssociations(
    roleId: number,
    roleUpdateData: DeleteAssociationsFromRoleDto,
  ) {
    const role = await this.m_authorizationRepository.unlinkRoleAssociations(
      roleId,
      roleUpdateData,
    );

    return role;
  }
}
