import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { IamModule } from '../../../src/iam/iam.module';
import { RoleName } from '../../../src/iam/authorization/enums/role-name.enum';
import { OrmRole } from '../../../src/iam/authorization/orm/entities/orm-role.entity';
import { OrmHelper } from '../../helpers/orm.helper';
import { AddPermissionsToRoleDto } from '../../../src/iam/authorization/dtos/add-permissions-to-role.dto';
import { ExamplePermission } from '../../../src/iam/authorization/enums/example-permission.enum';
import { OrmPermission } from '../../../src/iam/authorization/orm/entities/orm-permission.entity';
import { AuthHelper } from '../../helpers/auth.helper';
import { CreateRoleDto } from '../../../src/iam/authorization/dtos/create-role.dto';
import { RolePermission } from '../../../src/iam/authorization/role.permissions';
import { OrmUser } from '../../../src/user/infrastructure/persistance/orm/entities/orm-user.entity';

describe('Roles (e2e)', () => {
  let app: INestApplication;
  let roleRepository: Repository<OrmRole>;
  let permissionRepository: Repository<OrmPermission>;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: +process.env.DATABASE_PORT,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        }),
        IamModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    roleRepository = moduleFixture.get<Repository<OrmRole>>(
      getRepositoryToken(OrmRole),
    );
    permissionRepository = moduleFixture.get<Repository<OrmPermission>>(
      getRepositoryToken(OrmPermission),
    );
    await app.init();
    dataSource = app.get<DataSource>(DataSource);

    await OrmHelper.clearTables(dataSource, [OrmUser, OrmRole, OrmPermission]);
    const authUser = await new AuthHelper(app).createAuthenticatedUser(
      RoleName.Admin,
      [RolePermission.CreateRole, RolePermission.AssignPermissionsToRole],
    );
    accessToken = authUser.accessToken;
  });

  afterAll(() => {
    app.close();
  });

  describe('POST /roles', () => {
    test('Create a new Role', async () => {
      // Act
      const { status } = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: RoleName.Client } as CreateRoleDto);

      // Assert
      expect(status).toEqual(201);
      const findRole = await roleRepository.findOne({
        where: { name: RoleName.Client },
      });
      expect(findRole).toMatchObject({ name: RoleName.Client });
    });
  });

  describe('POST /roles/roleId/permissions', () => {
    test('Add a set of permissions to a Role', async () => {
      // Arrange
      const createdPermission1 = await permissionRepository.save({
        type: ExamplePermission.CanCreateResource,
        description: faker.lorem.sentence(),
      });
      const createdPermission2 = await permissionRepository.save({
        type: ExamplePermission.CanUpdateResource,
        description: faker.lorem.sentence(),
      });
      const createdRole = await roleRepository.save({
        name: RoleName.TravelAgent,
      });

      // Act
      const { status } = await request(app.getHttpServer())
        .post(`/roles/${createdRole.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          permissionIds: [createdPermission1.id, createdPermission2.id],
        } as AddPermissionsToRoleDto);

      // Assert
      expect(status).toEqual(200);
      const findRole = await roleRepository.findOne({
        where: { id: createdRole.id },
        relations: ['permissions'],
      });
      expect(findRole).toMatchObject({
        ...createdRole,
        permissions: expect.arrayContaining([
          expect.objectContaining({ id: createdPermission1.id }),
          expect.objectContaining({ id: createdPermission2.id }),
        ]),
      });
    });
  });
});
