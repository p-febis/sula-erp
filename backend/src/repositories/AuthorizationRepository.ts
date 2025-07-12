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

    if(userIds.length > 0) {
      await this.client.userRole.createMany({
	data: userIds.map(userId => ({ userId, roleId }))
      })
    }

    if (permissionIds.length > 0) {
      await this.client.rolePermission.createMany({
	data: permissionIds.map((permissionId) => ({ permissionId, roleId })),
      });
    }

    const role = await this.client.role.findUnique({
      where: { id: roleId },
      include: {
        users: {
	  include: {
	    user: {
	      select: {
		username: true,
	      }
	    }
	  }
	},
        permissions: {
	  include: {
	    permission: {
	      select: {
		key: true
	      }
	    }
	  }
	},
      },
    })

    return role;
  }

  async findRoleById(roleId: number) {
    const role = await this.client.role.findFirst({
      where: {
        id: roleId,
      },
      include: {
        users: {
	  include: {
	    user: {
	      select: {
		username: true,
	      }
	    }
	  }
	},
        permissions: {
	  include: {
	    permission: {
	      select: {
		key: true
	      }
	    }
	  }
	},
      },
    });

    return role;
  }

  async findAllPermissions() {
    const permissions = await this.client.permission.findMany();
    return permissions;
  }
}
