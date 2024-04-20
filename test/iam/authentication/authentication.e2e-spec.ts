import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IamModule } from '../../../src/iam/iam.module';
import { UserRepository } from '../../../src/user/application/ports/user.repository';
import { SignUpDto } from '../../../src/iam/authentication/dtos/sign-up.dto';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'travel-package-proposal-db',
          autoLoadEntities: true,
          synchronize: true,
        }),
        IamModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    userRepository = moduleFixture.get<UserRepository>(UserRepository);
  });

  afterAll(() => {
    app.close();
  });

  describe('POST /authentication/sign-up', () => {
    let dto: SignUpDto;

    beforeEach(() => {
      const password = faker.internet.password({ prefix: '!Aa0' });
      dto = {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password,
        confirmPassword: password,
      };
    });

    test('Sign up a User successfully', async () => {
      const { statusCode } = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(dto);

      expect(statusCode).toBe(HttpStatus.CREATED);
      const userExists = await userRepository.findByCriteria({
        email: dto.email,
      });
      expect(userExists).toBeTruthy();
    });

    test('Password and confirm password should match', async () => {
      dto.confirmPassword = faker.internet.password({ prefix: '!Aa0' });
      const { statusCode } = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(dto);

      expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test.each(['name', 'email', 'password', 'confirmPassword'])(
      'Invalid %s is not allowed',
      async (field) => {
        // Arrange
        delete dto[field];

        // Act
        const { statusCode } = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send(dto);

        // Assert
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
      },
    );

    test('User cannot register with an existent email', async () => {
      // Arrange
      await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(dto);

      // Act
      const { statusCode } = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(dto);

      // Assert
      expect(statusCode).toBe(HttpStatus.CONFLICT);
    });
  });
});
