import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { BcryptService } from './hashing/bcrypt/bcrypt.service';
import { HashingService } from './ports/hashing.service';
import { AuthenticationService } from './authentication/application/authentication.service';
import { AuthenticationController } from './authentication/presenters/controllers/authentication.controller';
import { UserModule } from '../user/user.module';
import { JwtService } from './token/jwt/jwt.service';
import { TokenService } from './ports/token.service';
import { RefreshTokenIdsStorage } from './authentication/infrastructure/refresh-token-ids/refresh-token-ids.storage';
import { SharedModule } from '../shared/shared.module';
import { AuthenticationGuard } from './authentication/application/guards/authentication/authentication.guard';
import { OrmPermission } from './authorization/infrastructure/persistence/orm/entities/orm-permission.entity';
import { OrmRole } from './authorization/infrastructure/persistence/orm/entities/orm-role.entity';
import { RolesService } from './authorization/application/roles.service';
import { PermissionsService } from './authorization/application/permissions.service';
import { RolesController } from './authorization/presenters/controllers/roles.controller';
import jwtConfig from './token/jwt/jwt.config';
import iamConfig from './iam.config';
import { RolesRepository } from './authorization/application/ports/roles.repository';
import { OrmRolesRepository } from './authorization/infrastructure/persistence/orm/repositories/orm-roles.repository';
import { PermissionsRepository } from './authorization/application/ports/permissions.repository';
import { Permission } from './authorization/domain/permission';

class DummyPermissionsRepository implements PermissionsRepository {
  findByRoles(roleIds: string[]): Promise<Permission[]> {
    return Promise.resolve([]);
  }
}

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(iamConfig),
    TypeOrmModule.forFeature([OrmRole, OrmPermission]),
    SharedModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: TokenService,
      useClass: JwtService,
    },
    RefreshTokenIdsStorage,
    AuthenticationService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    RolesService,
    PermissionsService,
    {
      provide: RolesRepository,
      useClass: OrmRolesRepository,
    },
    {
      provide: PermissionsRepository,
      useClass: DummyPermissionsRepository,
    },
  ],
  controllers: [AuthenticationController, RolesController],
  exports: [
    AuthenticationService,
    PermissionsService,
    RolesRepository,
    PermissionsRepository,
    SharedModule,
  ],
})
export class IamModule {}
