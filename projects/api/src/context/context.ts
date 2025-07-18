import { Connection, Model } from 'mongoose';
import UserSchema, { User } from '../models/user';
import UserIdentitySchema, { UserIdentity } from '../models/user-identity';
import { injectable } from 'inversify';
import LoginAuditSchema, { LoginAudit } from '../models/login-audit';
import SubmissionSchema, { Submission } from '../models/submisssion';

@injectable()
export class Context {
  public users: Model<User, {}>;
  public userIdentities: Model<UserIdentity, {}>;
  public loginAudits: Model<LoginAudit, {}>;
  public submissions: Model<Submission, {}>;

  constructor() {}

  public setModels(connection: Connection): void {
    this.users = connection.model<User>('User', UserSchema, 'users');
    this.userIdentities = connection.model<UserIdentity>(
      'UserIdentity',
      UserIdentitySchema,
      'userIdentities'
    );
    this.loginAudits = connection.model<LoginAudit>(
      'LoginAudit',
      LoginAuditSchema,
      'loginAudits'
    );
    this.submissions = connection.model<Submission>(
      'Submission',
      SubmissionSchema,
      'submissions'
    );
  }
}
