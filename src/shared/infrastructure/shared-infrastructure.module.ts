import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisService } from './redis/redis.service';
import { StorageService } from '../application/ports/storage.service';
import redisConfig from './redis/redis.config';

@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [{ provide: StorageService, useClass: RedisService }],
  exports: [StorageService],
})
export class SharedInfrastructureModule {}
