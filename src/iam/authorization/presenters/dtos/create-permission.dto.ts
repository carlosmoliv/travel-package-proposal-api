import { IsEnum, MaxLength } from 'class-validator';

import { PermissionType } from '../../domain/types/permission.type';
import { ExamplePermission } from '../../domain/enums/example-permission.enum';

export class CreatePermissionDto {
  @IsEnum(ExamplePermission)
  type: PermissionType;

  @MaxLength(100)
  description?: string;
}
