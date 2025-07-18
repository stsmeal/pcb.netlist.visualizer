import { injectable, inject } from 'inversify';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { UserIdentity } from '../models/user-identity';
import { User } from '../models/user';
import { config } from '../config';
import { Context } from '../context/context';
import { TYPES } from '../constants/types';

@injectable()
export class AuthService {
  constructor(@inject(TYPES.Context) private context: Context) {}

  public async authenticate(username: string, password: string) {
    username = username.toLowerCase();
    let userIdentity = await this.context.userIdentities.findOne({
      username: username,
    });
    if (userIdentity && (await compare(password, userIdentity.hash))) {
      let user = await this.context.users.findOne({ username: username });
      const token = sign(JSON.stringify(user), config.secret);
      this.context.loginAudits
        .create({ user: user, time: new Date(), dateCreated: new Date() })
        .then()
        .catch(error => {
          console.log(error);
        });
      return await { user, token };
    } else {
      throw 'Incorrect Username or Password';
    }
  }

  public async create(user: User, password: string): Promise<User> {
    user.username = user.username.toLowerCase();
    if (await this.context.users.findOne({ username: user.username })) {
      throw 'Username is Taken';
    }

    await this.context.userIdentities.create(<UserIdentity>{
      username: user.username,
      hash: await hash(password, 10),
    });

    user.dateCreated = new Date();
    return (await this.context.users.create(user)) as User;
  }
}
