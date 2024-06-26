import { Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { OrmRoleRepository } from './orm-role.repository';
import { OrmRole } from '../entities/orm-role.entity';
import { Role } from '../../../../domain/role';
import { RoleName } from '../../../../domain/enums/role-name.enum';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  save: jest.fn(),
});

describe('OrmRolesRepository', () => {
  let sut: OrmRoleRepository;
  let typeOrmRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        OrmRoleRepository,
        {
          provide: getRepositoryToken(OrmRole),
          useValue: createMockRepository(),
        },
      ],
    }).compile();
    sut = module.get<OrmRoleRepository>(OrmRoleRepository);
    typeOrmRepository = module.get<MockRepository>(getRepositoryToken(OrmRole));
  });

  describe('save()', () => {
    test('Persist a Role on database', async () => {
      const role = new Role(RoleName.Client);
      role.name = RoleName.Admin;
      typeOrmRepository.save.mockResolvedValueOnce(OrmRole);

      await sut.save(role);

      expect(typeOrmRepository.save).toHaveBeenCalled();
    });
  });
});
