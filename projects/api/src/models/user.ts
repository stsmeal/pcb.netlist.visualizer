import { Schema, Document } from 'mongoose';

export interface User extends Document<{}> {
  username: string;
  firstname: string;
  lastname: string;
  dateCreated: Date;
  deleted: boolean;
}

const UserSchema = new Schema({
  username: { type: String, unique: true, lowercase: true },
  firstname: { type: String },
  lastname: { type: String },
  dateCreated: { type: Date },
  deleted: { type: Schema.Types.Boolean, default: false },
});

UserSchema.pre('find', function () {
  let user = this;
  user.where({ deleted: false });
});

export default UserSchema;
