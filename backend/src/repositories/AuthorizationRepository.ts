import { Role, PrismaClient } from "@/../generated/prisma";
import { CreateRoleDto } from "@/models/authorization";

export interface IAuthorizationRepository {
  createRole(roleCreationData: CreateRoleDto): Promise<Role | null>;
  findAllRoles(): Promise<Role[] | null>;
  addUsersToRole(roleId: number, userIds: number[]): Promise<Role | null>;
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

  async addUsersToRole(
    roleId: number,
    userIds: number[],
  ): Promise<Role | null> {
    if (userIds.length === 0) return null;

    await this.client.userRole.createMany({
      data: userIds.map((userId) => ({
        roleId,
        userId,
      })),
    });

    const updatedRole = await this.client.role.findFirst({
      where: {
        id: roleId,
      },
      include: {
        users: true,
      },
    });

    return updatedRole;
  }
}
