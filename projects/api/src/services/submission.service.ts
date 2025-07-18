import { injectable, inject } from 'inversify';
import { Context } from '../context/context';
import { TYPES } from '../constants/types';
import { Submission } from '../models/submisssion';
import { User } from '../models/user';
import { withTimeout } from '../utils/timeout-middleware';

@injectable()
export class SubmissionService {
  constructor(@inject(TYPES.Context) private context: Context) {}

  public async getForUser(userId: string): Promise<Submission[]> {
    return await withTimeout(
      this.context.submissions
        .find({
          user: userId,
        })
        .sort({ dateCreated: -1 }),
      5000,
      'Submissions lookup'
    );
  }

  public async create(submission: Submission, user: User): Promise<Submission> {
    return await withTimeout(
      this.context.submissions.create(<Submission>{
        ...submission,
        dateCreated: new Date(),
        user: user._id,
      }),
      10000,
      'Submission creation'
    );
  }
}
