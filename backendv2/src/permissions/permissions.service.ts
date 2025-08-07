import { Injectable } from "@nestjs/common";
import { PermissionsRepository } from "./permissions.repository";

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async findAll() {
    const permissionsResult = await this.permissionsRepository.findAll();
    return permissionsResult;
  }
}
