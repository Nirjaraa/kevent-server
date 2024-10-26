import mongoose from "mongoose";

export interface IUser extends Document {
  id: any;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  batch: number;
  department: string;
  year: number;
  avatarURL?: string;
  exampleId?: string;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  emailVerified: Boolean;
  verificationCode?: Number;
}
