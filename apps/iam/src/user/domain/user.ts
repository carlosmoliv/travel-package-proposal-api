import { Role } from '../../authorization/role/domain/role';

export class User {
  public name: string;
  public email: string;
  public password: string;
  public roles: Role[];

  constructor(public id: string) {}
}
