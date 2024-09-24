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
    },
    password: {
      type: String,
      required: true,
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
      requires: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

// Export the User model
export default User;
