import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../interface/User.interface";

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      //not required for oauth
    },
    department: {
      type: String,
      required: true,
    },

    avatarURL: {
      type: String,
      required: false,
    },
    batch: {
      type: Number,
      required: false,
    },
    year: {
      type: Number,
      required: false,
    },
    exampleId: {
      type: String,
      required: false,
    },
    resetPasswordOtp: {
      type: String,
    },

    resetPasswordOtpExpires: {
      type: Date,
    },

    emailVerified: {
      type: Boolean,
    },
    verificationCode: {
      type: Number,
    },
    firebaseUid: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
