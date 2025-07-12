import { Role, PrismaClient, Permission } from "@/../generated/prisma";
import { CreateRoleDto, UpdateRoleDto } from "@/models/authorization";

export interface IAuthorizationRepository {
  createRole(roleCreationData: CreateRoleDto): Promise<Role | null>;
  findAllRoles(): Promise<Role[] | null>;
  findAllPermissions(): Promise<Permission[] | null>;
  updateRole(
    roleId: number,
    roleUpdateData: UpdateRoleDto,
  ): Promise<Role | null>;
  findRoleById(roleId: number): Promise<Role | null>;
}

export class AuthorizationRepository implements IAuthorizationRepository {
  client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  async createRole(roleCreationData: CreateRoleDto) {
    const role = await this.client.role.create({
      data: {
        name: roleCreationData.name,
      },
    });

    return role;
  }

  async findAllRoles() {
    const roles = await this.client.role.findMany();

    return roles;
  }

  async updateRole(
    roleId: number,
    { userIds, permissionIds }: UpdateRoleDto,
  ): Promise<Role | null> {
    const role = await this.client.role.update({
      where: {
        id: roleId,
      },
      data: {
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
        },
        permissions: {
          connect: permissionIds.map((permissionId) => ({ id: permissionId })),
        },
      },
      include: {
        users: true,
        permissions: true,
      },
    });

    return role;
  }

  async findRoleById(roleId: number) {
    const role = await this.client.role.findFirst({
      where: {
        id: roleId,
      },
      include: {
        users: true,
        permissions: true,
      },
    });

    return role;
  }

  async findAllPermissions() {
    const permissions = await this.client.permission.findMany();
    return permissions;
  }
}
