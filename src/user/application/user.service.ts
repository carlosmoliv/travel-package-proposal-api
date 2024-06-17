import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from './ports/user.repository';
import { User } from '../domain/user';
import { PermissionType } from '../../iam/authorization/domain/types/permission.type';
import { PermissionsService } from '../../iam/authorization/application/permissions.service';
import { AddRolesToUserInput } from './inputs/add-roles-to-user.input';
import { RolesService } from '../../iam/authorization/application/roles.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
  ) {}

  async getPermissionTypes(userId: string): Promise<PermissionType[]> {
    const user = await this.getById(userId);
    const rolesIds = user.roles.map((role) => role.id);
    const permissions = await this.permissionsService.getByRoles(rolesIds);
    return permissions.map((permission) => permission.type);
  }

  async addRolesToUser(
    addRolesToUserInput: AddRolesToUserInput,
  ): Promise<void> {
    const { userId, roleIds } = addRolesToUserInput;
    const user = await this.getById(userId);
    user.roles = await this.rolesService.findByIds(roleIds);
    await this.userRepository.save(user);
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findByCriteria({ id });
    if (!user) throw new NotFoundException('User does not exist.');
    return user;
  }
}
