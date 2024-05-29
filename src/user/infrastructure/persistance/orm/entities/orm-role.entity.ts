import { Column, Entity, ManyToMany, JoinTable } from 'typeorm';

import { OrmPermission } from '../../../../../iam/authorization/infrastructure/persistence/orm/entities/orm-permission.entity';
import { RoleName } from '../../../../../iam/authorization/domain/enums/role-name.enum';
import { OrmBaseEntity } from '../../../../../shared/infrastructure/persistence/orm/entities/orm-base.entity';

@Entity('roles')
export class OrmRole extends OrmBaseEntity {
  @Column({ unique: true })
  name: RoleName;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => OrmPermission)
  @JoinTable()
  permissions: OrmPermission[];
}
