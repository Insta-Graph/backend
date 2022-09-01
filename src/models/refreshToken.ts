import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IRefreshToken {
  user: string;
  token: string;
  expires: number;
  created: Date;
  isExpired: boolean;
}

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expires: Number,
  created: { type: Date, default: Date.now },
});

// eslint-disable-next-line func-names
schema.virtual('isExpired').get(function (this: IRefreshToken) {
  return Date.now() >= this.expires;
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    // remove these props when object is serialized
    // eslint-disable-next-line no-param-reassign
    delete ret._id;
    // eslint-disable-next-line no-param-reassign
    delete ret.user;
  },
});

export default mongoose.model<IRefreshToken>('RefreshToken', schema);
