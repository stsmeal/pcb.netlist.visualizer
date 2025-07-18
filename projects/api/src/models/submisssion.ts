import { Schema, Document } from 'mongoose';
import { User } from './user';

export interface Submission extends Document<{}> {
  data: string;
  user: User;
  dateCreated: Date;
  deleted: boolean;
}

const SubmissionSchema = new Schema({
  data: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  dateCreated: { type: Date },
  deleted: { type: Schema.Types.Boolean, default: false },
});

SubmissionSchema.pre('find', function () {
  let user = this;
  user.where({ deleted: false });
});

export default SubmissionSchema;
