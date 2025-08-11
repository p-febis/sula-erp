import { Injectable } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesRepository } from "./roles.repository";

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.rolesRepository.create(createRoleDto);
    return role;
  }

  async findAll() {
    const roles = await this.rolesRepository.findAll();

    return roles;
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne(id);
    return role;
  }

  async updateOne(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesRepository.updateOne(id, updateRoleDto);
    return role;
  }

  async deleteOne(id: number) {
    const role = this.rolesRepository.deleteOne(id);
    return role;
  }

  async createAssociations(
    roleId: number,
    parameters: { userIds: number[]; permissionIds: number[] },
  ) {
    return await this.rolesRepository.createAssociations(roleId, parameters);
  }

  async deleteAssociations(
    roleId: number,
    parameters: { userIds: number[]; permissionIds: number[] },
  ) {

    return await this.rolesRepository.deleteAssociations(roleId, parameters);
  }
}
