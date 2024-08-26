import { genSalt, hash, compare } from 'bcrypt';

import { Injectable } from '@nestjs/common';

import { HashingService } from '@app/iam-lib/ports/hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}