import { lastValueFrom } from 'rxjs';

import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PERMISSIONS_KEY } from '@app/common/iam/decorators/permissions.decorator';

import { PermissionType } from '../../permission.type';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!contextPermissions) return true;
    const activeUserData: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];

    const userPermissions = await lastValueFrom(
      this.userService.send('user.get.permissions', activeUserData.userId),
    );

    return contextPermissions.every((contextPermission) =>
      userPermissions.includes(contextPermission),
    );
  }
}
