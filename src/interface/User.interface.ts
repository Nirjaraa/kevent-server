import mongoose from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  batch: number;
  department: string;
  avatarURL?: string;
  exampleId?: string;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
}
