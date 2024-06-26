import { In, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RoleRepository } from '../../../../application/ports/role.repository';
import { Role } from '../../../../domain/role';
import { OrmRole } from '../entities/orm-role.entity';

@Injectable()
export class OrmRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(OrmRole)
    private readonly rolesRepository: Repository<OrmRole>,
  ) {}

  async save(role: Role): Promise<void> {
    await this.rolesRepository.save(role);
  }

  async findById(id: string): Promise<Role> {
    return this.rolesRepository.findOne({ where: { id: id } });
  }

  async findByIds(id: string[]): Promise<Role[]> {
    return this.rolesRepository.find({
      where: {
        id: In(id),
      },
    });
  }
}
