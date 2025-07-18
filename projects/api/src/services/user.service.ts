import { injectable, inject } from 'inversify';
import { TYPES } from '../constants/types';
import { hash } from 'bcryptjs';
import { UserIdentity } from '../models/user-identity';
import { User } from '../models/user';
import { Context } from '../context/context';
import { withTimeout } from '../utils/timeout-middleware';

@injectable()
export class UserService {
  constructor(@inject(TYPES.Context) private context: Context) {}

  public async create(user: User, password: string) {
    user.username = user.username.toLowerCase();

    // Add timeout to database operations
    const existingUser = await withTimeout(
      this.context.users.findOne({ username: user.username }),
      5000,
      'User lookup'
    );

    if (existingUser) {
      throw 'Username is Taken';
    }

    await withTimeout(
      this.context.userIdentities.create(<UserIdentity>{
        username: user.username,
        hash: await hash(password, 10),
      }),
      10000,
      'User identity creation'
    );

    user.dateCreated = new Date();
    return await withTimeout(
      this.context.users.create(user),
      10000,
      'User creation'
    );
  }

  public async findByUsername(username: string): Promise<User | null> {
    return await withTimeout(
      this.context.users.findOne({ username: username.toLowerCase() }),
      5000,
      'User lookup by username'
    );
  }
}
