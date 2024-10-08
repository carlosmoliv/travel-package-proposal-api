import * as Joi from 'joi';

import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { CommonModule } from '@app/common';
import { IAM_SERVICE } from '@app/common/constants';
import { AuthenticationGuard } from '@app/common/iam/guards/authentication-guard/authentication.guard';

import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids/refresh-token-ids.storage';
import { typeOrmAsyncConfig } from './config/orm.config';
import { UserModule } from './user/user.module';
import { TokenService } from './shared/token/token.service';
import { JwtService } from './shared/token/jwt/jwt.service';
import { HashingService } from './shared/hashing/hashing.service';
import { BcryptService } from './shared/hashing/bcrypt/bcrypt.service';
import { IamController } from './iam.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    CommonModule,
    forwardRef(() => UserModule),
    ClientsModule.registerAsync([
      {
        name: IAM_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: 'iam_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    RefreshTokenIdsStorage,
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: TokenService,
      useClass: JwtService,
    },
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  controllers: [AuthenticationController, IamController],
  exports: [HashingService],
})
export class IamModule {}
