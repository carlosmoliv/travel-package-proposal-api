import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '../authentication/decorators/public.decorator';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Public()
  @Post()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<void> {
    await this.permissionService.create(createPermissionDto);
  }
}
