import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  password: string;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, 'email already exists in database!'],
      required: [true, 'email not provided'],
      validate: {
        validator(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: '{VALUE} is not a valid email!',
      },
    },
    fullName: {
      type: String,
      required: [true, 'full name not provided'],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export default model<IUser>('User', userSchema);
